using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading.Tasks;
using BrainFIT.Application.Interfaces.Services;
using BrainFIT.Application.Contracts.Answers;
using BrainFIT.Application.Contracts.Quizzes;
using System;
using System.Collections.Generic;

namespace BrainFIT.API.Hubs
{
    public class GameState
    {
        public Guid QuizId { get; set; }
        public Guid SessionId { get; set; }
        public List<QuestionResponse> Questions { get; set; } = new();
        public int CurrentQuestionIndex { get; set; } = -1;
        public DateTime? QuestionStartTime { get; set; }
    }

    [Authorize]
    public class QuizHub : Hub
    {
        private readonly IQuizService _quizService;
        private readonly IAnswerService _answerService;
        private readonly IHubContext<QuizHub> _hubContext;

        // quizId -> dictionary of usernames (used as a concurrent hashset to prevent duplicates)
        private static readonly ConcurrentDictionary<string, ConcurrentDictionary<string, byte>> _lobbyUsers = new();
        
        // quizId -> GameState
        private static readonly ConcurrentDictionary<string, GameState> _activeGames = new();

        // quizId -> (username -> score)
        private static readonly ConcurrentDictionary<string, ConcurrentDictionary<string, int>> _gameScores = new();

        // connectionId -> { quizId, username }
        private static readonly ConcurrentDictionary<string, (string QuizId, string Username)> _connectionToUserInfo = new();

        public QuizHub(IQuizService quizService, IAnswerService answerService, IHubContext<QuizHub> hubContext)
        {
            _quizService = quizService;
            _answerService = answerService;
            _hubContext = hubContext;
        }

        // Associates a connection with a specific quiz lobby room
        public async Task JoinLobby(string quizId, string username)
        {
            // If user was already in a lobby via this connection, remove them first
            if (_connectionToUserInfo.TryRemove(Context.ConnectionId, out var oldInfo))
            {
                if (_lobbyUsers.TryGetValue(oldInfo.QuizId, out var oldRoomUsers))
                {
                    oldRoomUsers.TryRemove(oldInfo.Username, out _);
                    var oldList = oldRoomUsers.Keys.ToList();
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, oldInfo.QuizId);
                    await Clients.Group(oldInfo.QuizId).SendAsync("LobbyUpdated", oldList);
                }
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, quizId);
            
            // Register user in the static tracker
            var roomUsers = _lobbyUsers.GetOrAdd(quizId, _ => new ConcurrentDictionary<string, byte>());
            roomUsers.TryAdd(username, 0);
            
            _connectionToUserInfo[Context.ConnectionId] = (quizId, username);

            // Send the complete updated list to everyone in the room

            // Send the complete updated list to everyone in the room
            var currentUsers = roomUsers.Keys.ToList();
            await Clients.Group(quizId).SendAsync("LobbyUpdated", currentUsers);

            // Handle Late Joiners / Gameplay Reconnections
            if (_activeGames.TryGetValue(quizId, out var gameState) && gameState.CurrentQuestionIndex >= 0)
            {
                if (gameState.CurrentQuestionIndex < gameState.Questions.Count)
                {
                    var nextQuestion = gameState.Questions[gameState.CurrentQuestionIndex];
                    var elapsed = gameState.QuestionStartTime.HasValue 
                        ? (int)(DateTime.UtcNow - gameState.QuestionStartTime.Value).TotalSeconds 
                        : 0;

                    var safeQuestion = new
                    {
                        id = nextQuestion.Id,
                        text = nextQuestion.Text,
                        basePoint = nextQuestion.BasePoint,
                        timeLimitInSeconds = nextQuestion.TimeLimitInSeconds,
                        elapsedSeconds = elapsed,
                        options = nextQuestion.Options.Select(o => new { id = o.Id, text = o.Text }).ToList(),
                        questionIndex = gameState.CurrentQuestionIndex,
                        totalQuestions = gameState.Questions.Count
                    };

                    await Clients.Caller.SendAsync("ReceiveQuestion", safeQuestion, gameState.SessionId);
                }
            }
        }

        public async Task StartQuiz(string quizId)
        {
            try
            {
                Console.WriteLine($"[QuizHub] StartQuiz invoked for {quizId}");
                if (!Guid.TryParse(quizId, out var parsedId))
                {
                    await Clients.Caller.SendAsync("StartQuizError", "Invalid Quiz ID.");
                    return;
                }

                var quizResult = await _quizService.GetByIdAsync(parsedId);
                if (!quizResult.Success || quizResult.Data == null)
                {
                    await Clients.Caller.SendAsync("StartQuizError", "Quiz could not be loaded.");
                    return;
                }
                
                if (quizResult.Data.Questions == null || quizResult.Data.Questions.Count == 0)
                {
                    // Let the caller know there are no questions to start
                    await Clients.Caller.SendAsync("StartQuizError", "Cannot start a quiz with zero questions. Add questions first.");
                    return;
                }

                var gameState = new GameState
                {
                    QuizId = parsedId,
                    SessionId = Guid.NewGuid(),
                    Questions = quizResult.Data.Questions.ToList(),
                    CurrentQuestionIndex = -1
                };

                _activeGames[quizId] = gameState;
                
                // Reset scores for this specific quiz session
                _gameScores.TryRemove(quizId, out _);

                Console.WriteLine($"[QuizHub] GameState initialized. Session: {gameState.SessionId}. Broadcasting QuizStarted...");
                await Clients.Group(quizId).SendAsync("QuizStarted", gameState.SessionId);
                
                // Wait slightly before sending the first question so clients can handle routing
                await Task.Delay(2500);
                
                Console.WriteLine($"[QuizHub] Advancing to first question...");
                await TriggerNextQuestion(quizId);
            }
            catch (Exception ex)
            {
                var fullError = $"[QuizHub] FATAL ERROR in StartQuiz: {ex.Message} --- STACK: {ex.StackTrace}";
                Console.WriteLine(fullError);
                await Clients.Caller.SendAsync("StartQuizError", $"INTERNAL ERROR: {ex.Message}");
            }
        }

        // Called to advance to the next question
        // Helper to trigger the static/context-aware next question
        private async Task TriggerNextQuestion(string quizId)
        {
            await NextQuestionStatic(quizId, _hubContext);
        }

        // Static method using IHubContext to survive disposal
        private static async Task NextQuestionStatic(string quizId, IHubContext<QuizHub> context)
        {
            if (!_activeGames.TryGetValue(quizId, out var gameState)) return;

            gameState.CurrentQuestionIndex++;

            if (gameState.CurrentQuestionIndex >= gameState.Questions.Count)
            {
                Console.WriteLine($"[QuizHub] Quiz {quizId} FINISHED. Sending 'QuizFinished' to group...");
                await context.Clients.Group(quizId).SendAsync("QuizFinished");
                _activeGames.TryRemove(quizId, out _);
                return;
            }

            var nextQuestion = gameState.Questions[gameState.CurrentQuestionIndex];
            gameState.QuestionStartTime = DateTime.UtcNow;

            var safeQuestion = new
            {
                id = nextQuestion.Id,
                text = nextQuestion.Text,
                basePoint = nextQuestion.BasePoint,
                timeLimitInSeconds = nextQuestion.TimeLimitInSeconds,
                options = nextQuestion.Options.Select(o => new { id = o.Id, text = o.Text }).ToList(),
                questionIndex = gameState.CurrentQuestionIndex,
                totalQuestions = gameState.Questions.Count
            };

            Console.WriteLine($"[QuizHub] Sending question {gameState.CurrentQuestionIndex} to {quizId}.");
            await context.Clients.Group(quizId).SendAsync("ReceiveQuestion", safeQuestion, gameState.SessionId);

            // Automated timer for the next question
            _ = Task.Run(async () =>
            {
                try
                {
                    // Delay is based on question limit + buffer
                    int waitMs = (nextQuestion.TimeLimitInSeconds + 3) * 1000;
                    await Task.Delay(waitMs);
                    
                    Console.WriteLine($"[QuizHub] Timer expired for {quizId}. CurrentIndex: {gameState.CurrentQuestionIndex}. Advancing...");

                    // Re-fetch state for safety
                    if (_activeGames.TryGetValue(quizId, out var currentGameState) && 
                        currentGameState.CurrentQuestionIndex == gameState.CurrentQuestionIndex)
                    {
                        await NextQuestionStatic(quizId, context);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[QuizHub] ERROR in background timer for {quizId}: {ex.Message}");
                }
            });
        }

        public async Task SubmitAnswer(string quizId, Guid questionId, Guid? optionId, int secondsElapsed)
        {
            if (!_activeGames.TryGetValue(quizId, out var gameState)) return;
            
            var username = _connectionToUserInfo.GetValueOrDefault(Context.ConnectionId).Username;
            if (string.IsNullOrEmpty(username)) return;

            var result = await _answerService.SubmitAsync(new SubmitAnswerRequest(questionId, optionId, secondsElapsed));
            
            if (result.Success && result.Data != null)
            {
                var scores = _gameScores.GetOrAdd(quizId, _ => new ConcurrentDictionary<string, int>());
                scores.AddOrUpdate(username, result.Data.Score, (key, oldScore) => oldScore + result.Data.Score);

                // Send result back to caller
                await Clients.Caller.SendAsync("AnswerResult", result.Data);

                // Broadcast top standings to everyone in the group
                var standings = scores.Select(kvp => new { userName = kvp.Key, score = kvp.Value })
                                     .OrderByDescending(x => x.score)
                                     .Take(10)
                                     .ToList();
                
                await Clients.Group(quizId).SendAsync("RealTimeLeaderboardUpdate", standings);
            }
        }
        
        // Optional: Remove from group on disconnect, though SignalR handles dead connections
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            if (_connectionToUserInfo.TryRemove(Context.ConnectionId, out var info))
            {
                if (_lobbyUsers.TryGetValue(info.QuizId, out var roomUsers))
                {
                    roomUsers.TryRemove(info.Username, out _);
                    var currentUsers = roomUsers.Keys.ToList();
                    await Clients.Group(info.QuizId).SendAsync("LobbyUpdated", currentUsers);
                }
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}

using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading.Tasks;

namespace BrainFIT.API.Hubs
{
    public class QuizHub : Hub
    {
        // quizId -> dictionary of usernames (used as a concurrent hashset to prevent duplicates)
        private static readonly ConcurrentDictionary<string, ConcurrentDictionary<string, byte>> _lobbyUsers = new();

        // Associates a connection with a specific quiz lobby room
        public async Task JoinLobby(string quizId, string username)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, quizId);
            
            // Register user in the static tracker
            var roomUsers = _lobbyUsers.GetOrAdd(quizId, _ => new ConcurrentDictionary<string, byte>());
            roomUsers.TryAdd(username, 0);

            // Send the complete updated list to everyone in the room
            var currentUsers = roomUsers.Keys.ToList();
            await Clients.Group(quizId).SendAsync("LobbyUpdated", currentUsers);
        }

        // Called by Admin/Host to start the quiz for everyone in the lobby
        public async Task StartQuiz(string quizId)
        {
            await Clients.Group(quizId).SendAsync("QuizStarted");
        }
        
        // Optional: Remove from group on disconnect, though SignalR handles dead connections
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // We would need to map ConnectionId to QuizId and Username to broadcast a UserLeft event
            await base.OnDisconnectedAsync(exception);
        }
    }
}

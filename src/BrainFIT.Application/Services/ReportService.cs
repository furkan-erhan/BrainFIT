using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Text;
using BrainFIT.Application.Common;
using BrainFIT.Application.Contracts.Reports;
using BrainFIT.Application.Interfaces.Repositories;
using BrainFIT.Application.Interfaces.Services;
using BrainFIT.Domain.Entities;

namespace BrainFIT.Application.Services
{
    public sealed class ReportService : IReportService
    {
        private readonly IQuizResultRepository _quizResultRepo;
        private readonly IUserAnswerRepository _userAnswerRepo;
        private readonly IUnitOfWork _uow;

        public ReportService(IQuizResultRepository quizResultRepo, IUserAnswerRepository userAnswerRepo, IUnitOfWork uow)
        {
            _quizResultRepo = quizResultRepo;
            _userAnswerRepo = userAnswerRepo;
            _uow = uow;
        }

        public async Task<Result<IReadOnlyList<LeaderboardEntryResponse>>> GetLeaderboardAsync(Guid quizId, Guid? sessionId = null, CancellationToken ct = default)
        {
            var results = await _quizResultRepo.GetLeaderboardAsync(quizId, sessionId, 10, ct);
            
            var response = results.Select(r => new LeaderboardEntryResponse(
                r.UserName,
                r.Score,
                r.SecondsElapsed,
                r.CreatedDate,
                r.SessionId
            )).ToList();

            return Result<IReadOnlyList<LeaderboardEntryResponse>>.Ok(response);
        }

        public async Task<Result<IReadOnlyList<UserProgressResponse>>> GetUserProgressAsync(string username, CancellationToken ct = default)
        {
            var results = await _quizResultRepo.GetUserProgressAsync(username, ct);

            var response = results.Select(r => new UserProgressResponse(
                r.QuizId,
                r.Quiz?.Title ?? "Unknown Quiz",
                r.Score,
                r.SecondsElapsed,
                r.CreatedDate
            )).ToList();

            return Result<IReadOnlyList<UserProgressResponse>>.Ok(response);
        }

        public async Task<Result> SubmitResultAsync(SubmitQuizResultRequest request, CancellationToken ct = default)
        {
            var result = new QuizResult
            {
                QuizId = request.QuizId,
                UserName = request.UserName,
                Score = request.TotalScore,
                SecondsElapsed = request.TotalSecondsElapsed,
                SessionId = request.SessionId
            };

            await _quizResultRepo.AddAsync(result);
            await _uow.SaveChangesAsync(ct);

            return Result.Ok("Result submitted successfully.");
        }

        public async Task<Result<byte[]>> GetLeaderboardCsvAsync(Guid quizId, Guid? sessionId = null, CancellationToken ct = default)
        {
            var results = await _quizResultRepo.GetLeaderboardAsync(quizId, sessionId, 100, ct);
            
            var csv = new StringBuilder();
            csv.AppendLine("Rank,UserName,Score,SecondsElapsed,AchievedAt");

            int rank = 1;
            foreach (var r in results)
            {
                csv.AppendLine($"{rank++},{r.UserName},{r.Score},{r.SecondsElapsed},{r.CreatedDate:yyyy-MM-dd HH:mm:ss}");
            }

            return Result<byte[]>.Ok(Encoding.UTF8.GetBytes(csv.ToString()));
        }

        public async Task<Result<IReadOnlyList<UserAnswerResponse>>> GetSessionAnswersAsync(Guid sessionId, string userName, CancellationToken ct = default)
        {
            var answers = await _userAnswerRepo.GetSessionAnswersAsync(sessionId, userName, ct);

            var response = answers.Select(a => new UserAnswerResponse(
                a.Question?.Text ?? "Unknown Question",
                a.Question?.Options.FirstOrDefault(o => o.Id == a.SelectedOptionId)?.Text ?? "No Answer",
                a.Question?.Options.FirstOrDefault(o => o.IsCorrect)?.Text ?? "Unknown",
                a.IsCorrect,
                a.Score,
                a.SecondsElapsed
            )).ToList();

            return Result<IReadOnlyList<UserAnswerResponse>>.Ok(response);
        }
    }
}

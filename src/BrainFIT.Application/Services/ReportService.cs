using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
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
        private readonly IUnitOfWork _uow;

        public ReportService(IQuizResultRepository quizResultRepo, IUnitOfWork uow)
        {
            _quizResultRepo = quizResultRepo;
            _uow = uow;
        }

        public async Task<Result<IReadOnlyList<LeaderboardEntryResponse>>> GetLeaderboardAsync(Guid quizId, CancellationToken ct = default)
        {
            var results = await _quizResultRepo.GetLeaderboardAsync(quizId, 10, ct);
            
            var response = results.Select(r => new LeaderboardEntryResponse(
                r.UserName,
                r.Score,
                r.SecondsElapsed,
                r.CreatedDate
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
                SecondsElapsed = request.TotalSecondsElapsed
            };

            await _quizResultRepo.AddAsync(result);
            await _uow.SaveChangesAsync(ct);

            return Result.Ok("Result submitted successfully.");
        }
    }
}

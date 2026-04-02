using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using BrainFIT.Application.Common;
using BrainFIT.Application.Contracts.Reports;

namespace BrainFIT.Application.Interfaces.Services
{
    public interface IReportService
    {
        Task<Result<IReadOnlyList<LeaderboardEntryResponse>>> GetLeaderboardAsync(Guid quizId, Guid? sessionId = null, CancellationToken ct = default);
        Task<Result<IReadOnlyList<UserProgressResponse>>> GetUserProgressAsync(string username, CancellationToken ct = default);
        Task<Result> SubmitResultAsync(SubmitQuizResultRequest request, CancellationToken ct = default);
        Task<Result<byte[]>> GetLeaderboardCsvAsync(Guid quizId, Guid? sessionId = null, CancellationToken ct = default);
        Task<Result<IReadOnlyList<UserAnswerResponse>>> GetSessionAnswersAsync(Guid sessionId, string userName, CancellationToken ct = default);
    }
}

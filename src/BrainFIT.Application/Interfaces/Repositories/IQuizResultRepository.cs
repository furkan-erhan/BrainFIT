using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using BrainFIT.Domain.Entities;

namespace BrainFIT.Application.Interfaces.Repositories
{
    public interface IQuizResultRepository : IGenericRepository<QuizResult>
    {
        Task<IReadOnlyList<QuizResult>> GetLeaderboardAsync(Guid quizId, int top = 10, CancellationToken ct = default);
        Task<IReadOnlyList<QuizResult>> GetUserProgressAsync(string username, CancellationToken ct = default);
    }
}

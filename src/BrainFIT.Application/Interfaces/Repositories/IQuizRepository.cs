using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using BrainFIT.Domain.Entities;

namespace BrainFIT.Application.Interfaces.Repositories
{
    public interface IQuizRepository
    {
        Task<IReadOnlyList<Quiz>> GetAllWithCountsAsync(CancellationToken ct = default);
        Task<Quiz?> GetByIdWithQuestionsAsync(Guid id, CancellationToken ct = default);
        Task<bool> AddQuestionToQuizAsync(Guid quizId, Guid questionId, CancellationToken ct = default);
        Task<bool> RemoveQuestionFromQuizAsync(Guid quizId, Guid questionId, CancellationToken ct = default);
    }
}

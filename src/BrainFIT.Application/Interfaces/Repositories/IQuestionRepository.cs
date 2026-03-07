using System;
using System.Threading;
using System.Threading.Tasks;
using BrainFIT.Domain.Entities;

namespace BrainFIT.Application.Interfaces.Repositories
{
    public interface IQuestionRepository
    {
        Task<Question?> GetWithOptionsAsync(Guid questionId, CancellationToken ct = default);
    }
}

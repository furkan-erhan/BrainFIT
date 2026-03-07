using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using BrainFIT.Application.Contracts.Quizzes;

namespace BrainFIT.Application.Interfaces.Services
{
    public interface IQuizService
    {
        Task<IReadOnlyList<QuizResponse>> GetAllAsync(CancellationToken ct = default);
        Task<Guid> CreateAsync(CreateQuizRequest request, CancellationToken ct = default);
        Task<bool> DeleteAsync(Guid id, CancellationToken ct = default);
    }
}

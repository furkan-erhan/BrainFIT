using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using BrainFIT.Application.Common;
using BrainFIT.Application.Contracts.Quizzes;

namespace BrainFIT.Application.Interfaces.Services
{
    public interface IQuizService
    {
        Task<Result<IReadOnlyList<QuizResponse>>> GetAllAsync(CancellationToken ct = default);
        Task<Result<QuizGetByIdResponse>> GetByIdAsync(Guid id, CancellationToken ct = default);
        Task<Result<Guid>> CreateAsync(CreateQuizRequest request, CancellationToken ct = default);
        Task<Result> DeleteAsync(Guid id, CancellationToken ct = default);
        Task<Result> AddQuestionToQuizAsync(Guid quizId, Guid questionId, CancellationToken ct = default);
        Task<Result> RemoveQuestionFromQuizAsync(Guid quizId, Guid questionId, CancellationToken ct = default);
    }
}

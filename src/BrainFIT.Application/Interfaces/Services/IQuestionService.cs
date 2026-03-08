using System;
using System.Threading;
using System.Threading.Tasks;
using BrainFIT.Application.Common;
using BrainFIT.Application.Contracts.Questions;

namespace BrainFIT.Application.Interfaces.Services
{
    public interface IQuestionService
    {
        Task<Result<Guid>> AddQuestionAsync(CreateQuestionRequest request, CancellationToken ct = default);
        Task<Result<BrainFIT.Domain.Entities.Question?>> GetByIdAsync(Guid id, CancellationToken ct = default);
    }
}

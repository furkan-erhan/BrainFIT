using System;
using System.Threading;
using System.Threading.Tasks;
using BrainFIT.Application.Contracts.Questions;

namespace BrainFIT.Application.Interfaces.Services
{
    public interface IQuestionService
    {
        Task<Guid> AddQuestionAsync(CreateQuestionRequest request, CancellationToken ct = default);
    }
}

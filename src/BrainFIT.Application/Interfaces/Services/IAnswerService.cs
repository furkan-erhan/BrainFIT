using System.Threading;
using System.Threading.Tasks;
using BrainFIT.Application.Contracts.Answers;

namespace BrainFIT.Application.Interfaces.Services
{
    public interface IAnswerService
    {
        Task<SubmitAnswerResponse> SubmitAsync(SubmitAnswerRequest request, CancellationToken ct = default);
    }
}

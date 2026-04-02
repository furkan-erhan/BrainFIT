using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using BrainFIT.Domain.Entities;

namespace BrainFIT.Application.Interfaces.Repositories
{
    public interface IUserAnswerRepository : IGenericRepository<UserAnswer>
    {
        Task<IReadOnlyList<UserAnswer>> GetSessionAnswersAsync(Guid sessionId, string userName, CancellationToken ct = default);
    }
}

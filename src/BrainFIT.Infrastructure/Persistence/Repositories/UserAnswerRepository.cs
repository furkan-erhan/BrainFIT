using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BrainFIT.Application.Interfaces.Repositories;
using BrainFIT.Domain.Entities;
using BrainFIT.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace BrainFIT.Infrastructure.Persistence.Repositories
{
    public sealed class UserAnswerRepository : GenericRepository<UserAnswer>, IUserAnswerRepository
    {
        public UserAnswerRepository(BrainFITDbContext db) : base(db)
        {
        }

        public async Task<IReadOnlyList<UserAnswer>> GetSessionAnswersAsync(Guid sessionId, string userName, CancellationToken ct = default)
        {
            return await _context.UserAnswers
                .Include(a => a.Question)
                .ThenInclude(q => q.Options)
                .Where(a => a.SessionId == sessionId && a.UserName == userName)
                .OrderBy(a => a.CreatedDate)
                .ToListAsync(ct);
        }
    }
}

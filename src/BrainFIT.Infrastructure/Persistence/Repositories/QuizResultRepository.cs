using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BrainFIT.Application.Interfaces.Repositories;
using BrainFIT.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BrainFIT.Infrastructure.Persistence.Repositories
{
    public sealed class QuizResultRepository : GenericRepository<QuizResult>, IQuizResultRepository
    {
        public QuizResultRepository(BrainFITDbContext context) : base(context)
        {
        }

        public async Task<IReadOnlyList<QuizResult>> GetLeaderboardAsync(Guid quizId, Guid? sessionId = null, int top = 10, CancellationToken ct = default)
        {
            var query = _context.QuizResults.Where(qr => qr.QuizId == quizId);
            
            if (sessionId.HasValue)
            {
                query = query.Where(qr => qr.SessionId == sessionId.Value);
            }

            return await query
                .OrderByDescending(qr => qr.Score)
                .ThenBy(qr => qr.SecondsElapsed)
                .Take(top)
                .ToListAsync(ct);
        }

        public async Task<IReadOnlyList<QuizResult>> GetUserProgressAsync(string username, CancellationToken ct = default)
        {
            return await _context.QuizResults
                .Include(qr => qr.Quiz)
                .Where(qr => qr.UserName == username)
                .OrderByDescending(qr => qr.CreatedDate)
                .ToListAsync(ct);
        }
    }
}

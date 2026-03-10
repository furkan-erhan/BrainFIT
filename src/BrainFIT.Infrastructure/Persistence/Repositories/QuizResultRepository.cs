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

        public async Task<IReadOnlyList<QuizResult>> GetLeaderboardAsync(Guid quizId, int top = 10, CancellationToken ct = default)
        {
            return await _context.QuizResults
                .Where(qr => qr.QuizId == quizId)
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

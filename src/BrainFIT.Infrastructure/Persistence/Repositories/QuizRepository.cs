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
    public sealed class QuizRepository : IQuizRepository
    {
        private readonly BrainFITDbContext _db;

        public QuizRepository(BrainFITDbContext db)
        {
            _db = db;
        }

        public async Task<IReadOnlyList<Quiz>> GetAllWithCountsAsync(CancellationToken ct = default)
        {
            return await _db.Quizzes
                .Include(q => q.Questions)
                .OrderByDescending(q => q.CreatedDate)
                .ToListAsync(ct);
        }
    }
}

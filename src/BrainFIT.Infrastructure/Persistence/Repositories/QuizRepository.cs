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
                .Where(q => !q.IsDeleted)
                .Include(q => q.QuizQuestions)
                .OrderByDescending(q => q.CreatedDate)
                .ToListAsync(ct);
        }

        public async Task<Quiz?> GetByIdWithQuestionsAsync(Guid id, CancellationToken ct = default)
        {
            return await _db.Quizzes
                .Include(q => q.QuizQuestions)
                    .ThenInclude(qq => qq.Question)
                        .ThenInclude(qu => qu.Options)
                .FirstOrDefaultAsync(q => q.Id == id && !q.IsDeleted, ct);
        }
    }
}

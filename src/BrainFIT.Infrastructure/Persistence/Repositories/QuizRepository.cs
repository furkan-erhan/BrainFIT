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

        public async Task<bool> AddQuestionToQuizAsync(Guid quizId, Guid questionId, CancellationToken ct = default)
        {
            // Prevent duplicates
            var exists = await _db.Set<QuizQuestion>()
                .AnyAsync(qq => qq.QuizId == quizId && qq.QuestionId == questionId, ct);
            if (exists) return false;

            var link = new QuizQuestion
            {
                QuizId = quizId,
                QuestionId = questionId
            };
            await _db.Set<QuizQuestion>().AddAsync(link, ct);
            return true;
        }

        public async Task<bool> RemoveQuestionFromQuizAsync(Guid quizId, Guid questionId, CancellationToken ct = default)
        {
            var link = await _db.Set<QuizQuestion>()
                .FirstOrDefaultAsync(qq => qq.QuizId == quizId && qq.QuestionId == questionId, ct);
            if (link == null) return false;

            _db.Set<QuizQuestion>().Remove(link);
            return true;
        }
    }
}

using System;
using System.Threading;
using System.Threading.Tasks;
using BrainFIT.Application.Interfaces.Repositories;
using BrainFIT.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BrainFIT.Infrastructure.Persistence.Repositories
{
    public sealed class QuestionRepository : IQuestionRepository
    {
        private readonly BrainFITDbContext _db;

        public QuestionRepository(BrainFITDbContext db)
        {
            _db = db;
        }

        public Task<Question?> GetWithOptionsAsync(Guid questionId, CancellationToken ct = default)
        {
            return _db.Set<Question>()
                .Include(q => q.Options)
                .FirstOrDefaultAsync(q => q.Id == questionId, ct);
        }
    }
}

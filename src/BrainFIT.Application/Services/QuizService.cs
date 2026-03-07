using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BrainFIT.Application.Contracts.Quizzes;
using BrainFIT.Application.Interfaces.Repositories;
using BrainFIT.Application.Interfaces.Services;
using BrainFIT.Domain.Entities;

namespace BrainFIT.Application.Services
{
    public sealed class QuizService : IQuizService
    {
        private readonly IQuizRepository _quizRepo;
        private readonly IGenericRepository<Quiz> _genericRepo;
        private readonly IUnitOfWork _uow;

        public QuizService(
            IQuizRepository quizRepo, 
            IGenericRepository<Quiz> genericRepo, 
            IUnitOfWork uow)
        {
            _quizRepo = quizRepo;
            _genericRepo = genericRepo;
            _uow = uow;
        }

        public async Task<IReadOnlyList<QuizResponse>> GetAllAsync(CancellationToken ct = default)
        {
            var quizzes = await _quizRepo.GetAllWithCountsAsync(ct);
            return quizzes.Select(q => new QuizResponse(
                q.Id,
                q.Title,
                q.Description,
                q.CreatedDate,
                q.Questions.Count
            )).ToList();
        }

        public async Task<Guid> CreateAsync(CreateQuizRequest request, CancellationToken ct = default)
        {
            var quiz = new Quiz
            {
                Title = request.Title,
                Description = request.Description
            };

            await _genericRepo.AddAsync(quiz);
            await _uow.SaveChangesAsync(ct);

            return quiz.Id;
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default)
        {
            var quiz = await _genericRepo.GetByIdAsync(id);
            if (quiz is null) return false;

            _genericRepo.Delete(quiz);
            await _uow.SaveChangesAsync(ct);
            return true;
        }
    }
}

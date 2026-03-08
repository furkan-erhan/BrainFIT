using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BrainFIT.Application.Common;
using BrainFIT.Application.Contracts.Questions;
using BrainFIT.Application.Interfaces.Repositories;
using BrainFIT.Application.Interfaces.Services;
using BrainFIT.Domain.Entities;

namespace BrainFIT.Application.Services
{
    public sealed class QuestionService : IQuestionService
    {
        private readonly IGenericRepository<Quiz> _quizRepo;
        private readonly IGenericRepository<Question> _questionRepo;
        private readonly IQuestionRepository _questionSpecificRepo;
        private readonly IUnitOfWork _uow;

        public QuestionService(
            IGenericRepository<Quiz> quizRepo,
            IGenericRepository<Question> questionRepo,
            IQuestionRepository questionSpecificRepo,
            IUnitOfWork uow)
        {
            _quizRepo = quizRepo;
            _questionRepo = questionRepo;
            _questionSpecificRepo = questionSpecificRepo;
            _uow = uow;
        }

        public async Task<Result<Guid>> AddQuestionAsync(CreateQuestionRequest request, CancellationToken ct = default)
        {
            // Acceptance: exactly 4 options
            if (request.Options is null || request.Options.Count != 4)
                return Result<Guid>.Failure("A question must have exactly 4 options.");

            // iyi pratik: 1 doğru şık
            if (request.Options.Count(o => o.IsCorrect) != 1)
                return Result<Guid>.Failure("A question must have exactly 1 correct option.");

            var quiz = await _quizRepo.GetByIdAsync(request.QuizId);
            if (quiz is null)
                return Result<Guid>.Failure("Quiz not found.");

            var question = new Question
            {
                QuizId = request.QuizId,
                Text = request.Text,
                BasePoint = request.BasePoint,
                TimeLimitInSeconds = request.TimeLimitInSeconds
            };

            foreach (var opt in request.Options)
            {
                var option = new Option
                {
                    Text = opt.Text,
                    IsCorrect = opt.IsCorrect,
                    QuestionId = question.Id
                };

                question.Options.Add(option);
            }

            // son güvenlik
            if (question.Options.Count != 4)
                return Result<Guid>.Failure("A question must have exactly 4 options.");

            await _questionRepo.AddAsync(question);
            await _uow.SaveChangesAsync(ct);

            return Result<Guid>.Ok(question.Id);
        }

        public async Task<Result<Question?>> GetByIdAsync(Guid id, CancellationToken ct = default)
        {
            var question = await _questionSpecificRepo.GetWithOptionsAsync(id, ct);
            return Result<Question?>.Ok(question);
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BrainFIT.Application.Contracts.Quizzes;
using BrainFIT.Application.Interfaces.Repositories;
using BrainFIT.Application.Interfaces.Services;
using BrainFIT.Domain.Entities;

using BrainFIT.Application.Common;

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

        public async Task<Result<IReadOnlyList<QuizResponse>>> GetAllAsync(CancellationToken ct = default)
        {
            var quizzes = await _quizRepo.GetAllWithCountsAsync(ct);
            var response = quizzes.Select(q => new QuizResponse(
                q.Id,
                q.Title,
                q.Description,
                q.CreatedDate,
                q.QuizQuestions.Count
            )).ToList();

            return Result<IReadOnlyList<QuizResponse>>.Ok(response);
        }

        public async Task<Result<QuizGetByIdResponse>> GetByIdAsync(Guid id, CancellationToken ct = default)
        {
            var quiz = await _quizRepo.GetByIdWithQuestionsAsync(id, ct);
            if (quiz is null)
                return Result<QuizGetByIdResponse>.Failure("Quiz not found");

            var response = new QuizGetByIdResponse(
                quiz.Id,
                quiz.Title,
                quiz.Description,
                quiz.CreatedDate,
                quiz.QuizQuestions.Select(qq => new QuestionResponse(
                    qq.Question.Id,
                    qq.Question.Text,
                    qq.Question.BasePoint,
                    qq.Question.TimeLimitInSeconds,
                    qq.Question.Options.Select(o => new OptionResponse(
                        o.Id,
                        o.Text,
                        o.IsCorrect
                    )).ToList()
                )).ToList()
            );

            return Result<QuizGetByIdResponse>.Ok(response);
        }

        public async Task<Result<Guid>> CreateAsync(CreateQuizRequest request, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(request.Title))
                return Result<Guid>.Failure("Title cannot be empty");

            var quiz = new Quiz
            {
                Title = request.Title,
                Description = request.Description
            };

            await _genericRepo.AddAsync(quiz);
            await _uow.SaveChangesAsync(ct);

            return Result<Guid>.Ok(quiz.Id);
        }

        public async Task<Result> DeleteAsync(Guid id, CancellationToken ct = default)
        {
            var quiz = await _genericRepo.GetByIdAsync(id);
            if (quiz is null || quiz.IsDeleted) 
                return Result.Failure("Quiz not found");

            quiz.IsDeleted = true;
            _genericRepo.Update(quiz);
            await _uow.SaveChangesAsync(ct);
            
            return Result.Ok("Quiz deleted successfully");
        }
    }
}

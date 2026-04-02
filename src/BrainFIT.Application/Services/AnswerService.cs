using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BrainFIT.Application.Common;
using BrainFIT.Application.Contracts.Answers;
using BrainFIT.Application.Interfaces.Repositories;
using BrainFIT.Application.Interfaces.Services;
using BrainFIT.Application.Utilities;
using BrainFIT.Domain.Entities;

namespace BrainFIT.Application.Services
{
    public sealed class AnswerService : IAnswerService
    {
        private readonly IQuestionRepository _questionRepository;
        private readonly IUnitOfWork _uow;
        private readonly IGenericRepository<UserAnswer> _userAnswerRepository;

        public AnswerService(
            IQuestionRepository questionRepository, 
            IUnitOfWork uow, 
            IGenericRepository<UserAnswer> userAnswerRepository)
        {
            _questionRepository = questionRepository;
            _uow = uow;
            _userAnswerRepository = userAnswerRepository;
        }

        public async Task<Result<SubmitAnswerResponse>> SubmitAsync(SubmitAnswerRequest request, CancellationToken ct = default)
        {
            var question = await _questionRepository.GetWithOptionsAsync(request.QuestionId, ct);
            if (question is null)
                return Result<SubmitAnswerResponse>.Failure("Question not found.");

            // Acceptance/DoD: options integrity
            if (question.Options is null || question.Options.Count != 4)
                return Result<SubmitAnswerResponse>.Failure("Question must have exactly 4 options.");

            if (!request.SelectedOptionId.HasValue)
                return Result<SubmitAnswerResponse>.Ok(new SubmitAnswerResponse(false, 0));

            var selected = question.Options.FirstOrDefault(o => o.Id == request.SelectedOptionId.Value);
            if (selected is null)
                return Result<SubmitAnswerResponse>.Failure("Selected option not found for this question.");

            var isCorrect = selected.IsCorrect;

            // MaxPoints = BasePoint
            var score = isCorrect
                ? TimeDecayScoring.Calculate(question.BasePoint, request.SecondsElapsed)
                : 0;

            // PERSIST ANSWER FOR ANALYTICS
            var userAnswer = new UserAnswer
            {
                QuizId = request.QuizId,
                QuestionId = request.QuestionId,
                UserName = request.UserName,
                SelectedOptionId = request.SelectedOptionId,
                IsCorrect = isCorrect,
                Score = (int)score,
                SecondsElapsed = request.SecondsElapsed,
                SessionId = request.SessionId
            };

            await _userAnswerRepository.AddAsync(userAnswer);
            await _uow.SaveChangesAsync(ct);

            return Result<SubmitAnswerResponse>.Ok(new SubmitAnswerResponse(isCorrect, (int)score));
        }
    }
}

using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BrainFIT.Application.Common;
using BrainFIT.Application.Contracts.Answers;
using BrainFIT.Application.Interfaces.Repositories;
using BrainFIT.Application.Interfaces.Services;
using BrainFIT.Application.Utilities;

namespace BrainFIT.Application.Services
{
    public sealed class AnswerService : IAnswerService
    {
        private readonly IQuestionRepository _questionRepository;

        public AnswerService(IQuestionRepository questionRepository)
        {
            _questionRepository = questionRepository;
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

            return Result<SubmitAnswerResponse>.Ok(new SubmitAnswerResponse(isCorrect, score));
        }
    }
}

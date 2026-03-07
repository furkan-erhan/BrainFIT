using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
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

        public async Task<SubmitAnswerResponse> SubmitAsync(SubmitAnswerRequest request, CancellationToken ct = default)
        {
            var question = await _questionRepository.GetWithOptionsAsync(request.QuestionId, ct);
            if (question is null)
                throw new InvalidOperationException("Question not found.");

            // Acceptance/DoD: options integrity
            if (question.Options is null || question.Options.Count != 4)
                throw new InvalidOperationException("Question must have exactly 4 options.");

            var selected = question.Options.FirstOrDefault(o => o.Id == request.SelectedOptionId);
            if (selected is null)
                throw new InvalidOperationException("Selected option not found for this question.");

            var isCorrect = selected.IsCorrect;

            // MaxPoints = BasePoint
            var score = isCorrect
                ? TimeDecayScoring.Calculate(question.BasePoint, request.SecondsElapsed)
                : 0;

            return new SubmitAnswerResponse(isCorrect, score);
        }
    }
}

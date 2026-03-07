using System;

namespace BrainFIT.Application.Contracts.Answers
{
    public sealed record SubmitAnswerRequest(
        Guid QuestionId,
        Guid SelectedOptionId,
        int SecondsElapsed
    );

    public sealed record SubmitAnswerResponse(
        bool IsCorrect,
        int Score
    );
}

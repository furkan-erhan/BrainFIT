using System;

namespace BrainFIT.Application.Contracts.Answers
{
    public sealed record SubmitAnswerRequest(
        Guid QuizId,
        Guid QuestionId,
        string UserName,
        Guid? SelectedOptionId,
        int SecondsElapsed,
        Guid? SessionId = null
    );

    public sealed record SubmitAnswerResponse(
        bool IsCorrect,
        int Score
    );
}

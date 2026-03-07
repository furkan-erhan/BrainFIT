using System;

namespace BrainFIT.Application.Contracts.Quizzes
{
    public sealed record CreateQuizRequest(
        string Title,
        string Description
    );

    public sealed record QuizResponse(
        Guid Id,
        string Title,
        string Description,
        DateTime CreatedDate,
        int QuestionCount
    );
}

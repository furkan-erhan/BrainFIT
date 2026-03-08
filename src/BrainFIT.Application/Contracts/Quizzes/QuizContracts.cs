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

    public sealed record QuizGetByIdResponse(
        Guid Id,
        string Title,
        string Description,
        DateTime CreatedDate,
        List<QuestionResponse> Questions
    );

    public sealed record QuestionResponse(
        Guid Id,
        string Text,
        int BasePoint,
        int TimeLimitInSeconds,
        List<OptionResponse> Options
    );

    public sealed record OptionResponse(
        Guid Id,
        string Text,
        bool IsCorrect
    );
}

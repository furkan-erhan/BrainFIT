using System;
using System.Collections.Generic;

namespace BrainFIT.Application.Contracts.Questions
{
    public sealed record CreateQuestionRequest(
        Guid QuizId,
        string Text,
        int BasePoint,
        int TimeLimitInSeconds,
        List<CreateOptionRequest> Options
    );

    public sealed record CreateOptionRequest(
        string Text,
        bool IsCorrect
    );
}

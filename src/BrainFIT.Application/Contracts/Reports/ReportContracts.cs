using System;

namespace BrainFIT.Application.Contracts.Reports
{
    public record LeaderboardEntryResponse(
        string UserName,
        double Score,
        double SecondsElapsed,
        DateTime AchievedAt,
        Guid? SessionId
    );

    public record UserProgressResponse(
        Guid QuizId,
        string QuizTitle,
        double Score,
        double SecondsElapsed,
        DateTime CompletedDate
    );

    public record SubmitQuizResultRequest(
        Guid QuizId,
        string UserName,
        double TotalScore,
        double TotalSecondsElapsed,
        Guid? SessionId
    );

    public record UserAnswerResponse(
        string QuestionText,
        string SelectedOptionText,
        string CorrectOptionText,
        bool IsCorrect,
        int Score,
        int SecondsElapsed
    );
}

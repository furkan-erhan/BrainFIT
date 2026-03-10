using System;

namespace BrainFIT.Application.Contracts.Reports
{
    public record LeaderboardEntryResponse(
        string UserName,
        double Score,
        double SecondsElapsed,
        DateTime AchievedAt
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
        double TotalSecondsElapsed
    );
}

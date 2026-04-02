using System;
using System.Collections.Generic;

namespace BrainFIT.Application.Contracts.Analytics;

public sealed record PerformanceTrendResponse(
    string QuizTitle,
    double Score,
    DateTime Date
);

public sealed record SubjectMasteryResponse(
    string Category,
    double SuccessRate, // 0 to 100
    int TotalQuestions
);

public sealed record AnalyticsSummaryResponse(
    string BestCategory,
    string WorstCategory,
    double AverageScore,
    int TotalQuizzesTaken
);

public sealed record AdminDashboardResponse(
    double AverageGlobalScore,
    int TotalParticipants,
    List<DifficultQuestionResponse> HardestQuestions,
    List<CategoryParticipationResponse> ParticipationByCategory
);

public sealed record DifficultQuestionResponse(
    Guid QuestionId,
    string QuestionText,
    double AccuracyRate
);

public sealed record CategoryParticipationResponse(
    string Category,
    int TotalAttempts
);

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BrainFIT.Application.Common;
using BrainFIT.Application.Contracts.Analytics;
using BrainFIT.Application.Interfaces.Services;
using BrainFIT.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace BrainFIT.Infrastructure.Services;

public sealed class AnalyticsService : IAnalyticsService
{
    private readonly BrainFITDbContext _db;

    public AnalyticsService(BrainFITDbContext db)
    {
        _db = db;
    }

    public async Task<Result<IReadOnlyList<PerformanceTrendResponse>>> GetUserPerformanceTrendsAsync(
        string userName, int limit = 20, CancellationToken ct = default)
    {
        var trends = await _db.QuizResults
            .Include(r => r.Quiz)
            .Where(r => r.UserName == userName)
            .OrderByDescending(r => r.CreatedDate)
            .Take(limit)
            .Select(r => new PerformanceTrendResponse(
                r.Quiz != null ? r.Quiz.Title : "Quiz #" + r.QuizId.ToString().Substring(0, 4),
                r.Score,
                r.CreatedDate
            ))
            .ToListAsync(ct);

        // Reverse so chart shows oldest -> newest left-to-right
        trends.Reverse();

        return Result<IReadOnlyList<PerformanceTrendResponse>>.Ok(trends);
    }

    public async Task<Result<IReadOnlyList<SubjectMasteryResponse>>> GetUserSubjectMasteryAsync(
        string userName, CancellationToken ct = default)
    {
        var answers = await _db.UserAnswers
            .Include(a => a.Question)
            .Where(a => a.UserName == userName)
            .ToListAsync(ct);

        var mastery = answers
            .GroupBy(a => a.Question?.Category ?? "Uncategorized")
            .Select(g => new SubjectMasteryResponse(
                g.Key,
                Math.Round((double)g.Count(x => x.IsCorrect) / g.Count() * 100, 1),
                g.Count()
            ))
            .OrderByDescending(m => m.SuccessRate)
            .ToList();

        return Result<IReadOnlyList<SubjectMasteryResponse>>.Ok(mastery);
    }

    public async Task<Result<AnalyticsSummaryResponse>> GetUserSummaryAsync(
        string userName, CancellationToken ct = default)
    {
        var userAnswers = await _db.UserAnswers
            .Include(a => a.Question)
            .Where(a => a.UserName == userName)
            .ToListAsync(ct);

        var userResults = await _db.QuizResults
            .Where(r => r.UserName == userName)
            .ToListAsync(ct);

        if (!userAnswers.Any())
        {
            return Result<AnalyticsSummaryResponse>.Ok(
                new AnalyticsSummaryResponse("N/A", "N/A", 0, userResults.Count));
        }

        var categoryStats = userAnswers
            .GroupBy(a => a.Question?.Category ?? "Uncategorized")
            .Select(g => new
            {
                Category = g.Key,
                Accuracy = (double)g.Count(x => x.IsCorrect) / g.Count()
            })
            .ToList();

        var best  = categoryStats.OrderByDescending(s => s.Accuracy).First().Category;
        var worst = categoryStats.OrderBy(s => s.Accuracy).First().Category;
        var avg   = userResults.Any() ? Math.Round(userResults.Average(r => r.Score), 1) : 0;

        return Result<AnalyticsSummaryResponse>.Ok(
            new AnalyticsSummaryResponse(best, worst, avg, userResults.Count));
    }

    public async Task<Result<AdminDashboardResponse>> GetAdminDashboardAsync(CancellationToken ct = default)
    {
        var quizResults = await _db.QuizResults.ToListAsync(ct);
        var userAnswers = await _db.UserAnswers
            .Include(a => a.Question)
            .ToListAsync(ct);

        var globalAvg        = quizResults.Any() ? Math.Round(quizResults.Average(r => r.Score), 1) : 0;
        var totalParticipants = quizResults.Select(r => r.UserName).Distinct().Count();

        var hardestQuestions = userAnswers
            .GroupBy(a => new { a.QuestionId, Text = a.Question?.Text ?? "Unknown Question" })
            .Select(g => new DifficultQuestionResponse(
                g.Key.QuestionId,
                g.Key.Text,
                Math.Round((double)g.Count(x => x.IsCorrect) / g.Count() * 100, 1)
            ))
            .OrderBy(q => q.AccuracyRate)
            .Take(5)
            .ToList();

        var categoryParticipation = userAnswers
            .GroupBy(a => a.Question?.Category ?? "Uncategorized")
            .Select(g => new CategoryParticipationResponse(g.Key, g.Count()))
            .OrderByDescending(c => c.TotalAttempts)
            .ToList();

        return Result<AdminDashboardResponse>.Ok(new AdminDashboardResponse(
            globalAvg,
            totalParticipants,
            hardestQuestions,
            categoryParticipation
        ));
    }
}

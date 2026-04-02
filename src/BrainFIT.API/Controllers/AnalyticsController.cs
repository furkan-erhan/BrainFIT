using System.Collections.Generic;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using BrainFIT.Application.Common;
using BrainFIT.Application.Contracts.Analytics;
using BrainFIT.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BrainFIT.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;

    public AnalyticsController(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    [HttpGet("student/performance")]
    public async Task<ActionResult<Result<IReadOnlyList<PerformanceTrendResponse>>>> GetPerformanceTrends(CancellationToken ct)
    {
        var userName = User.FindFirstValue(ClaimTypes.Name) ?? User.Identity?.Name;
        if (string.IsNullOrEmpty(userName)) return Unauthorized();

        var result = await _analyticsService.GetUserPerformanceTrendsAsync(userName, 20, ct);
        return Ok(result);
    }

    [HttpGet("student/mastery")]
    public async Task<ActionResult<Result<IReadOnlyList<SubjectMasteryResponse>>>> GetSubjectMastery(CancellationToken ct)
    {
        var userName = User.FindFirstValue(ClaimTypes.Name) ?? User.Identity?.Name;
        if (string.IsNullOrEmpty(userName)) return Unauthorized();

        var result = await _analyticsService.GetUserSubjectMasteryAsync(userName, ct);
        return Ok(result);
    }

    [HttpGet("student/summary")]
    public async Task<ActionResult<Result<AnalyticsSummaryResponse>>> GetSummary(CancellationToken ct)
    {
        var userName = User.FindFirstValue(ClaimTypes.Name) ?? User.Identity?.Name;
        if (string.IsNullOrEmpty(userName)) return Unauthorized();

        var result = await _analyticsService.GetUserSummaryAsync(userName, ct);
        return Ok(result);
    }

    [HttpGet("admin/overview")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<Result<AdminDashboardResponse>>> GetAdminOverview(CancellationToken ct)
    {
        var result = await _analyticsService.GetAdminDashboardAsync(ct);
        return Ok(result);
    }
}

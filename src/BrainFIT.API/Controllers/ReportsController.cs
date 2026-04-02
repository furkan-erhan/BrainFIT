using System.Collections.Generic;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using BrainFIT.Application.Common;
using BrainFIT.Application.Contracts.Reports;
using BrainFIT.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace BrainFIT.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public sealed class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportsController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet("leaderboard/{quizId:guid}")]
        public async Task<ActionResult<Result<IReadOnlyList<LeaderboardEntryResponse>>>> GetLeaderboard(Guid quizId, CancellationToken ct, [FromQuery] Guid? sessionId = null)
        {
            var result = await _reportService.GetLeaderboardAsync(quizId, sessionId, ct);
            return Ok(result);
        }

        [HttpGet("my-progress")]
        public async Task<ActionResult<Result<IReadOnlyList<UserProgressResponse>>>> GetMyProgress(CancellationToken ct, [FromQuery] string? username = null)
        {
            // Note: In a real app, 'username' would be extracted from JWT claims.
            // For now, we align with the frontend's mock auth/lobby logic.
            if (string.IsNullOrWhiteSpace(username))
            {
                return BadRequest(Result<IReadOnlyList<UserProgressResponse>>.Failure("Username is required for progress report."));
            }

            var result = await _reportService.GetUserProgressAsync(username, ct);
            return Ok(result);
        }

        [HttpPost("submit")]
        public async Task<ActionResult<Result>> SubmitResult([FromBody] SubmitQuizResultRequest request, CancellationToken ct)
        {
            var result = await _reportService.SubmitResultAsync(request, ct);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpGet("leaderboard/{quizId:guid}/export")]
        public async Task<IActionResult> GetLeaderboardCsv(Guid quizId, [FromQuery] Guid? sessionId = null, CancellationToken ct = default)
        {
            var result = await _reportService.GetLeaderboardCsvAsync(quizId, sessionId, ct);
            if (!result.Success || result.Data == null) return BadRequest(result);

            return File(result.Data, "text/csv", $"Leaderboard_{quizId}_{(sessionId?.ToString() ?? "All")}.csv");
        }

        [HttpGet("session/{sessionId:guid}/answers")]
        public async Task<ActionResult<Result<IReadOnlyList<UserAnswerResponse>>>> GetSessionAnswers(Guid sessionId, CancellationToken ct)
        {
            var userName = User.FindFirstValue(ClaimTypes.Name) ?? User.Identity?.Name;
            if (string.IsNullOrEmpty(userName)) return Unauthorized();

            var result = await _reportService.GetSessionAnswersAsync(sessionId, userName, ct);
            return Ok(result);
        }
    }
}

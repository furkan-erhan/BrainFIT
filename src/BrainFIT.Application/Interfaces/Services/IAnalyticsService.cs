using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using BrainFIT.Application.Common;
using BrainFIT.Application.Contracts.Analytics;

namespace BrainFIT.Application.Interfaces.Services;

public interface IAnalyticsService
{
    Task<Result<IReadOnlyList<PerformanceTrendResponse>>> GetUserPerformanceTrendsAsync(string userName, int limit = 20, CancellationToken ct = default);
    Task<Result<IReadOnlyList<SubjectMasteryResponse>>> GetUserSubjectMasteryAsync(string userName, CancellationToken ct = default);
    Task<Result<AnalyticsSummaryResponse>> GetUserSummaryAsync(string userName, CancellationToken ct = default);
    Task<Result<AdminDashboardResponse>> GetAdminDashboardAsync(CancellationToken ct = default);
}

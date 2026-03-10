using BrainFIT.Domain.Common;

namespace BrainFIT.Domain.Entities;

public class QuizResult : BaseEntity
{
    public Guid QuizId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public double Score { get; set; }
    public double SecondsElapsed { get; set; }

    // Navigation property (optional, but good for joins)
    public Quiz Quiz { get; set; } = null!;
}

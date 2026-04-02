using BrainFIT.Domain.Common;

namespace BrainFIT.Domain.Entities;

public class UserAnswer : BaseEntity
{
    public Guid QuizId { get; set; }
    public Guid QuestionId { get; set; }
    public Guid? SelectedOptionId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int Score { get; set; }
    public int SecondsElapsed { get; set; }
    public Guid? SessionId { get; set; }

    // Navigation properties
    public Quiz Quiz { get; set; } = null!;
    public Question Question { get; set; } = null!;
}

using BrainFIT.Domain.Common;

namespace BrainFIT.Domain.Entities;

public class Question : BaseEntity
{
    public string Text { get; set; } = string.Empty;
    public int BasePoint { get; set; } = 10;
    public int TimeLimitInSeconds { get; set; } = 20;
    
    public Guid QuizId { get; set; }
    public Quiz Quiz { get; set; } = null!;

    public ICollection<Option> Options { get; set; } = new List<Option>();
}
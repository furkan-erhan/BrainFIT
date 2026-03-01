using BrainFIT.Domain.Common;

namespace BrainFIT.Domain.Entities;

public class Option : BaseEntity
{
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; } = false;
    
    
    public Guid QuestionId { get; set; }
    public Question Question { get; set; } = null!;
}
using BrainFIT.Domain.Common;

namespace BrainFIT.Domain.Entities;

public class Question : BaseEntity
{
    public string Text { get; set; } = string.Empty;
    public int BasePoint { get; set; } = 10;
    public int TimeLimitInSeconds { get; set; } = 20;
    
    public string? CategoryId { get; set; }
    public int DifficultyLevel { get; set; } = 1;

    public ICollection<Option> Options { get; set; } = new List<Option>();
    public ICollection<QuizQuestion> QuizQuestions { get; set; } = new List<QuizQuestion>();
}
using BrainFIT.Domain.Common;

namespace BrainFIT.Domain.Entities;

public class Quiz : BaseEntity
{
    public string Title { get; set; } = String.Empty;
    public string Description { get; set; } = string.Empty;

    public ICollection<Question> Questions { get; set; } = new List<Question>();
}
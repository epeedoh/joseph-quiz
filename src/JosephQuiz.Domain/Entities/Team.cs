using JosephQuiz.Domain.Common;

namespace JosephQuiz.Domain.Entities;

public sealed class Team : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public string JoinCode { get; set; } = string.Empty;

    public int TotalScore { get; set; }

    public int TotalXp { get; set; }

    public ICollection<TeamMember> Members { get; set; } = new List<TeamMember>();
}

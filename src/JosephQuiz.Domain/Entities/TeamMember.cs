using JosephQuiz.Domain.Common;

namespace JosephQuiz.Domain.Entities;

public sealed class TeamMember : BaseEntity
{
    public Guid TeamId { get; set; }

    public Team Team { get; set; } = null!;

    public Guid ProfileId { get; set; }

    public Profile Profile { get; set; } = null!;

    public int ContributionScore { get; set; }

    public int ContributionXp { get; set; }

    public DateTimeOffset JoinedAtUtc { get; set; } = DateTimeOffset.UtcNow;
}

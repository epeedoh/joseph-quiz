using JosephQuiz.Domain.Common;

namespace JosephQuiz.Domain.Entities;

public sealed class Profile : BaseEntity
{
    public string Pseudo { get; set; } = string.Empty;

    public int TotalXp { get; set; }

    public int TotalScore { get; set; }

    public int TotalCorrectAnswers { get; set; }

    public int TotalAnsweredQuestions { get; set; }

    public int BestCombo { get; set; }

    public double AverageResponseTimeMs { get; set; }

    public DateTimeOffset LastSeenAtUtc { get; set; } = DateTimeOffset.UtcNow;

    public ICollection<Score> Scores { get; set; } = new List<Score>();

    public ICollection<UserAnswer> UserAnswers { get; set; } = new List<UserAnswer>();

    public ICollection<CompetitiveSession> CompetitiveSessions { get; set; } = new List<CompetitiveSession>();

    public ICollection<TeamMember> TeamMemberships { get; set; } = new List<TeamMember>();
}

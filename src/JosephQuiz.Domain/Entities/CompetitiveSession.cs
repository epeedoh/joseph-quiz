using JosephQuiz.Domain.Common;
using JosephQuiz.Domain.Enums;

namespace JosephQuiz.Domain.Entities;

public sealed class CompetitiveSession : BaseEntity
{
    public Guid ProfileId { get; set; }

    public Profile Profile { get; set; } = null!;

    public BiblicalZone? Zone { get; set; }

    public int ChapterStart { get; set; }

    public int ChapterEnd { get; set; }

    public int TimerSeconds { get; set; }

    public int FinalScore { get; set; }

    public int XpEarned { get; set; }

    public int CorrectAnswers { get; set; }

    public int TotalQuestions { get; set; }

    public int MaxCombo { get; set; }

    public int BonusPoints { get; set; }

    public double AverageResponseTimeMs { get; set; }

    public DateTimeOffset StartedAtUtc { get; set; } = DateTimeOffset.UtcNow;

    public DateTimeOffset EndedAtUtc { get; set; } = DateTimeOffset.UtcNow;
}

using JosephQuiz.Domain.Common;
using JosephQuiz.Domain.Enums;

namespace JosephQuiz.Domain.Entities;

public sealed class Score : BaseEntity
{
    public Guid ProfileId { get; set; }

    public Profile Profile { get; set; } = null!;

    public QuizMode Mode { get; set; }

    public BiblicalZone? Zone { get; set; }

    public int ChapterStart { get; set; }

    public int ChapterEnd { get; set; }

    public int Points { get; set; }

    public int XpEarned { get; set; }

    public int CorrectAnswers { get; set; }

    public int TotalQuestions { get; set; }

    public int BonusPoints { get; set; }

    public int MaxCombo { get; set; }

    public double AverageResponseTimeMs { get; set; }

    public DateTimeOffset CompletedAtUtc { get; set; } = DateTimeOffset.UtcNow;
}

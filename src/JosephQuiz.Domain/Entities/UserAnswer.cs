using JosephQuiz.Domain.Common;
using JosephQuiz.Domain.Enums;

namespace JosephQuiz.Domain.Entities;

public sealed class UserAnswer : BaseEntity
{
    public Guid ProfileId { get; set; }

    public Profile Profile { get; set; } = null!;

    public Guid QuestionId { get; set; }

    public Question Question { get; set; } = null!;

    public string SelectedOption { get; set; } = string.Empty;

    public bool IsCorrect { get; set; }

    public int ResponseTimeMs { get; set; }

    public QuizMode Mode { get; set; }

    public DateTimeOffset AnsweredAtUtc { get; set; } = DateTimeOffset.UtcNow;
}

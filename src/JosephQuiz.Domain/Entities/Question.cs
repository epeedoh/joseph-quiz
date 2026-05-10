using JosephQuiz.Domain.Common;
using JosephQuiz.Domain.Enums;

namespace JosephQuiz.Domain.Entities;

public sealed class Question : BaseEntity
{
    public string Text { get; set; } = string.Empty;

    public string OptionA { get; set; } = string.Empty;

    public string OptionB { get; set; } = string.Empty;

    public string OptionC { get; set; } = string.Empty;

    public string OptionD { get; set; } = string.Empty;

    public string CorrectOption { get; set; } = "A";

    public string VerseReference { get; set; } = string.Empty;

    public string VerseText { get; set; } = string.Empty;

    public string Explanation { get; set; } = string.Empty;

    public int Chapter { get; set; }

    public BiblicalZone Zone { get; set; }

    public DifficultyLevel Difficulty { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<UserAnswer> UserAnswers { get; set; } = new List<UserAnswer>();
}

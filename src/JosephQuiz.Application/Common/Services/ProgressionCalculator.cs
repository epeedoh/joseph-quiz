using JosephQuiz.Shared.Constants;
using JosephQuiz.Shared.Models;

namespace JosephQuiz.Application.Common.Services;

public static class ProgressionCalculator
{
    public static LevelDescriptor ResolveLevel(int xp) => QuizRules.ResolveLevel(xp);

    public static int CalculateXp(int correctAnswers, int fastAnswers, int chapterBonusCount, int maxCombo)
    {
        var comboBonus = maxCombo >= 3 ? maxCombo * 3 : 0;
        return (correctAnswers * QuizRules.CorrectAnswerXp) +
               (fastAnswers * QuizRules.FastAnswerXp) +
               (chapterBonusCount * QuizRules.ChapterCompletionXp) +
               comboBonus;
    }
}

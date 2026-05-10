using JosephQuiz.Domain.Entities;

namespace JosephQuiz.Application.Common.Models;

public sealed record EvaluatedAnswerResult(
    Question Question,
    string SelectedOption,
    bool IsCorrect,
    bool IsFast,
    int ResponseTimeMs);

public sealed record QuizEvaluationResult(
    int Score,
    int XpEarned,
    int CorrectAnswers,
    int TotalQuestions,
    int MaxCombo,
    int FastAnswers,
    int BonusPoints,
    int ChapterBonusCount,
    double Accuracy,
    double AverageResponseTimeMs,
    IReadOnlyList<EvaluatedAnswerResult> Answers);

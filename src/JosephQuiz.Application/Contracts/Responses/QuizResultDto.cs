namespace JosephQuiz.Application.Contracts.Responses;

public sealed record QuizResultDto(
    int Score,
    int XpEarned,
    int CorrectAnswers,
    int TotalQuestions,
    int MaxCombo,
    int FastAnswers,
    double Accuracy,
    string LevelTitle,
    string Badge,
    IReadOnlyList<AdaptiveRecommendationDto> Recommendations);

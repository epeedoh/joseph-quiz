namespace JosephQuiz.Application.Contracts.Responses;

public sealed record ProfileDto(
    string Pseudo,
    int TotalXp,
    int TotalScore,
    string LevelTitle,
    string Badge,
    double Accuracy,
    double AverageResponseTimeMs,
    int BestCombo,
    string? TeamName,
    IReadOnlyList<AdaptiveRecommendationDto> Recommendations,
    IReadOnlyList<RecentScoreDto> RecentScores);

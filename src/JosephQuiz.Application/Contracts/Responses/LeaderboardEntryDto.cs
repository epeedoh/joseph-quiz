namespace JosephQuiz.Application.Contracts.Responses;

public sealed record LeaderboardEntryDto(
    int Rank,
    string Pseudo,
    string? TeamName,
    int TotalScore,
    int TotalXp,
    double Accuracy,
    int BestCombo);

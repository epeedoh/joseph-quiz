namespace JosephQuiz.Application.Contracts.Responses;

public sealed record TeamLeaderboardEntryDto(
    int Rank,
    string TeamName,
    string JoinCode,
    int TotalScore,
    int TotalXp,
    int MemberCount);

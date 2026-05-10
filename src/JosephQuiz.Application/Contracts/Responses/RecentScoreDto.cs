namespace JosephQuiz.Application.Contracts.Responses;

public sealed record RecentScoreDto(
    Guid Id,
    string Mode,
    int? Zone,
    int Points,
    int XpEarned,
    int CorrectAnswers,
    int TotalQuestions,
    DateTimeOffset CompletedAtUtc);

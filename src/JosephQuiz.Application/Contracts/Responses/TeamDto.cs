namespace JosephQuiz.Application.Contracts.Responses;

public sealed record TeamDto(Guid Id, string Name, string JoinCode, int TotalScore, int TotalXp, int MemberCount);

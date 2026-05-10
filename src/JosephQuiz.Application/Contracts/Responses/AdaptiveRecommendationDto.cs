namespace JosephQuiz.Application.Contracts.Responses;

public sealed record AdaptiveRecommendationDto(
    string Title,
    string Description,
    int? Zone,
    int? ChapterStart,
    int? ChapterEnd,
    string Focus);

using JosephQuiz.Application.Contracts.Responses;
using JosephQuiz.Domain.Entities;

namespace JosephQuiz.Application.Common.Interfaces;

public interface IAdaptiveRecommendationService
{
    Task<IReadOnlyList<AdaptiveRecommendationDto>> BuildRecommendationsAsync(Profile profile, CancellationToken cancellationToken);
}

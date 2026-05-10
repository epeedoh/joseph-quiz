using AutoMapper;
using JosephQuiz.Application.Common.Interfaces;
using JosephQuiz.Application.Common.Services;
using JosephQuiz.Application.Contracts.Responses;
using MediatR;

namespace JosephQuiz.Application.Features.Profiles.Queries.GetProfile;

public sealed record GetProfileQuery(string Pseudo) : IRequest<ProfileDto>;

public sealed class GetProfileQueryHandler(
    IProfileRepository profileRepository,
    IScoreRepository scoreRepository,
    IAdaptiveRecommendationService adaptiveRecommendationService,
    IMapper mapper) : IRequestHandler<GetProfileQuery, ProfileDto>
{
    public async Task<ProfileDto> Handle(GetProfileQuery request, CancellationToken cancellationToken)
    {
        var profile = await profileRepository.GetByPseudoAsync(request.Pseudo, cancellationToken);
        if (profile is null)
        {
            var level = ProgressionCalculator.ResolveLevel(0);
            return new ProfileDto(
                request.Pseudo,
                0,
                0,
                level.Title,
                level.Badge,
                0d,
                0d,
                0,
                null,
                [],
                []);
        }

        var activeTeamNames = await profileRepository.GetActiveTeamNamesAsync(profile.Id, cancellationToken);
        activeTeamNames.TryGetValue(profile.Id, out var teamName);
        var recommendations = await adaptiveRecommendationService.BuildRecommendationsAsync(profile, cancellationToken);
        var recentScores = mapper.Map<IReadOnlyList<RecentScoreDto>>(await scoreRepository.GetRecentScoresAsync(profile.Id, 5, cancellationToken));
        var levelDescriptor = ProgressionCalculator.ResolveLevel(profile.TotalXp);
        var accuracy = profile.TotalAnsweredQuestions == 0
            ? 0d
            : Math.Round((double)profile.TotalCorrectAnswers / profile.TotalAnsweredQuestions, 3);

        return new ProfileDto(
            profile.Pseudo,
            profile.TotalXp,
            profile.TotalScore,
            levelDescriptor.Title,
            levelDescriptor.Badge,
            accuracy,
            profile.AverageResponseTimeMs,
            profile.BestCombo,
            teamName,
            recommendations,
            recentScores);
    }
}

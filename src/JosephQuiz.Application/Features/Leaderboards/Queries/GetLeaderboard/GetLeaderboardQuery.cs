using JosephQuiz.Application.Common.Interfaces;
using JosephQuiz.Application.Contracts.Responses;
using MediatR;

namespace JosephQuiz.Application.Features.Leaderboards.Queries.GetLeaderboard;

public sealed record GetLeaderboardQuery(int Take = 20) : IRequest<IReadOnlyList<LeaderboardEntryDto>>;

public sealed class GetLeaderboardQueryHandler(
    IProfileRepository profileRepository) : IRequestHandler<GetLeaderboardQuery, IReadOnlyList<LeaderboardEntryDto>>
{
    public async Task<IReadOnlyList<LeaderboardEntryDto>> Handle(GetLeaderboardQuery request, CancellationToken cancellationToken)
    {
        var profiles = await profileRepository.GetTopProfilesAsync(request.Take, cancellationToken);
        var teamNames = await profileRepository.GetActiveTeamNamesAsync(profiles.Select(profile => profile.Id), cancellationToken);

        return profiles
            .Select((profile, index) =>
            {
                var accuracy = profile.TotalAnsweredQuestions == 0
                    ? 0d
                    : Math.Round((double)profile.TotalCorrectAnswers / profile.TotalAnsweredQuestions, 3);

                teamNames.TryGetValue(profile.Id, out var teamName);
                return new LeaderboardEntryDto(
                    index + 1,
                    profile.Pseudo,
                    teamName,
                    profile.TotalScore,
                    profile.TotalXp,
                    accuracy,
                    profile.BestCombo);
            })
            .ToList();
    }
}

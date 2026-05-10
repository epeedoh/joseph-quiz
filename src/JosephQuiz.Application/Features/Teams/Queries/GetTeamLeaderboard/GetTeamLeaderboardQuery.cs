using JosephQuiz.Application.Common.Interfaces;
using JosephQuiz.Application.Contracts.Responses;
using MediatR;

namespace JosephQuiz.Application.Features.Teams.Queries.GetTeamLeaderboard;

public sealed record GetTeamLeaderboardQuery(int Take = 20) : IRequest<IReadOnlyList<TeamLeaderboardEntryDto>>;

public sealed class GetTeamLeaderboardQueryHandler(
    ITeamRepository teamRepository) : IRequestHandler<GetTeamLeaderboardQuery, IReadOnlyList<TeamLeaderboardEntryDto>>
{
    public async Task<IReadOnlyList<TeamLeaderboardEntryDto>> Handle(GetTeamLeaderboardQuery request, CancellationToken cancellationToken)
    {
        var teams = await teamRepository.GetLeaderboardAsync(request.Take, cancellationToken);

        return teams
            .Select((team, index) => new TeamLeaderboardEntryDto(
                index + 1,
                team.Name,
                team.JoinCode,
                team.TotalScore,
                team.TotalXp,
                team.Members.Count))
            .ToList();
    }
}

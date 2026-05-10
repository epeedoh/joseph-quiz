using JosephQuiz.Domain.Entities;

namespace JosephQuiz.Application.Common.Interfaces;

public interface ITeamRepository
{
    Task<Team?> GetByNameAsync(string name, CancellationToken cancellationToken);

    Task<Team?> GetByJoinCodeAsync(string joinCode, CancellationToken cancellationToken);

    Task<Team?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    Task AddAsync(Team team, CancellationToken cancellationToken);

    Task AddMemberAsync(TeamMember member, CancellationToken cancellationToken);

    Task<List<Team>> GetLeaderboardAsync(int take, CancellationToken cancellationToken);
}

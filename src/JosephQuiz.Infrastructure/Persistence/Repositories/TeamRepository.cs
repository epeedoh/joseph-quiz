using JosephQuiz.Application.Common.Interfaces;
using JosephQuiz.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace JosephQuiz.Infrastructure.Persistence.Repositories;

public sealed class TeamRepository(JosephQuizDbContext dbContext) : ITeamRepository
{
    public Task<Team?> GetByNameAsync(string name, CancellationToken cancellationToken)
        => dbContext.Teams
            .Include(team => team.Members)
            .FirstOrDefaultAsync(team => team.Name == name.Trim(), cancellationToken);

    public Task<Team?> GetByJoinCodeAsync(string joinCode, CancellationToken cancellationToken)
        => dbContext.Teams
            .Include(team => team.Members)
            .FirstOrDefaultAsync(team => team.JoinCode == joinCode.Trim().ToUpperInvariant(), cancellationToken);

    public Task<Team?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
        => dbContext.Teams
            .Include(team => team.Members)
            .FirstOrDefaultAsync(team => team.Id == id, cancellationToken);

    public async Task AddAsync(Team team, CancellationToken cancellationToken)
        => await dbContext.Teams.AddAsync(team, cancellationToken);

    public async Task AddMemberAsync(TeamMember member, CancellationToken cancellationToken)
        => await dbContext.TeamMembers.AddAsync(member, cancellationToken);

    public Task<List<Team>> GetLeaderboardAsync(int take, CancellationToken cancellationToken)
        => dbContext.Teams
            .AsNoTracking()
            .Include(team => team.Members)
            .OrderByDescending(team => team.TotalScore)
            .ThenByDescending(team => team.TotalXp)
            .Take(take)
            .ToListAsync(cancellationToken);
}

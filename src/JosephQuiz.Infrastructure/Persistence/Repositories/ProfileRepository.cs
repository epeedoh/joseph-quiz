using JosephQuiz.Application.Common.Interfaces;
using JosephQuiz.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace JosephQuiz.Infrastructure.Persistence.Repositories;

public sealed class ProfileRepository(JosephQuizDbContext dbContext) : IProfileRepository
{
    public async Task<Profile?> GetByPseudoAsync(string pseudo, CancellationToken cancellationToken)
        => await dbContext.Profiles
            .Include(profile => profile.TeamMemberships)
            .ThenInclude(membership => membership.Team)
            .FirstOrDefaultAsync(profile => profile.Pseudo == pseudo.Trim(), cancellationToken);

    public async Task<Profile> GetOrCreateAsync(string pseudo, CancellationToken cancellationToken)
    {
        var normalizedPseudo = pseudo.Trim();
        var existing = await GetByPseudoAsync(normalizedPseudo, cancellationToken);
        if (existing is not null)
        {
            return existing;
        }

        var profile = new Profile
        {
            Pseudo = normalizedPseudo
        };

        await dbContext.Profiles.AddAsync(profile, cancellationToken);
        return profile;
    }

    public Task<List<Profile>> GetTopProfilesAsync(int take, CancellationToken cancellationToken)
        => dbContext.Profiles
            .AsNoTracking()
            .OrderByDescending(profile => profile.TotalScore)
            .ThenByDescending(profile => profile.TotalXp)
            .Take(take)
            .ToListAsync(cancellationToken);

    public async Task<Dictionary<Guid, string?>> GetActiveTeamNamesAsync(IEnumerable<Guid> profileIds, CancellationToken cancellationToken)
    {
        var ids = profileIds.Distinct().ToList();
        var memberships = await dbContext.TeamMembers
            .AsNoTracking()
            .Include(member => member.Team)
            .Where(member => ids.Contains(member.ProfileId))
            .OrderByDescending(member => member.JoinedAtUtc)
            .ToListAsync(cancellationToken);

        return memberships
            .GroupBy(member => member.ProfileId)
            .ToDictionary(group => group.Key, group => group.First().Team?.Name);
    }

    public Task<Dictionary<Guid, string?>> GetActiveTeamNamesAsync(Guid profileId, CancellationToken cancellationToken)
        => GetActiveTeamNamesAsync([profileId], cancellationToken);

    public async Task AddAsync(Profile profile, CancellationToken cancellationToken)
        => await dbContext.Profiles.AddAsync(profile, cancellationToken);
}

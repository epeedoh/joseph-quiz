using JosephQuiz.Domain.Entities;

namespace JosephQuiz.Application.Common.Interfaces;

public interface IProfileRepository
{
    Task<Profile?> GetByPseudoAsync(string pseudo, CancellationToken cancellationToken);

    Task<Profile> GetOrCreateAsync(string pseudo, CancellationToken cancellationToken);

    Task<List<Profile>> GetTopProfilesAsync(int take, CancellationToken cancellationToken);

    Task<Dictionary<Guid, string?>> GetActiveTeamNamesAsync(IEnumerable<Guid> profileIds, CancellationToken cancellationToken);

    Task<Dictionary<Guid, string?>> GetActiveTeamNamesAsync(Guid profileId, CancellationToken cancellationToken);

    Task AddAsync(Profile profile, CancellationToken cancellationToken);
}

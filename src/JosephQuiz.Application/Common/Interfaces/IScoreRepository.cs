using JosephQuiz.Domain.Entities;

namespace JosephQuiz.Application.Common.Interfaces;

public interface IScoreRepository
{
    Task AddAsync(Score score, CancellationToken cancellationToken);

    Task<List<Score>> GetRecentScoresAsync(Guid profileId, int take, CancellationToken cancellationToken);
}

using JosephQuiz.Application.Common.Interfaces;
using JosephQuiz.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace JosephQuiz.Infrastructure.Persistence.Repositories;

public sealed class ScoreRepository(JosephQuizDbContext dbContext) : IScoreRepository
{
    public async Task AddAsync(Score score, CancellationToken cancellationToken)
        => await dbContext.Scores.AddAsync(score, cancellationToken);

    public Task<List<Score>> GetRecentScoresAsync(Guid profileId, int take, CancellationToken cancellationToken)
        => dbContext.Scores
            .AsNoTracking()
            .Where(score => score.ProfileId == profileId)
            .OrderByDescending(score => score.CompletedAtUtc)
            .Take(take)
            .ToListAsync(cancellationToken);
}

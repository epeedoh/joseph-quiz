using JosephQuiz.Application.Common.Interfaces;
using JosephQuiz.Domain.Entities;

namespace JosephQuiz.Infrastructure.Persistence.Repositories;

public sealed class CompetitiveSessionRepository(JosephQuizDbContext dbContext) : ICompetitiveSessionRepository
{
    public async Task AddAsync(CompetitiveSession session, CancellationToken cancellationToken)
        => await dbContext.CompetitiveSessions.AddAsync(session, cancellationToken);
}

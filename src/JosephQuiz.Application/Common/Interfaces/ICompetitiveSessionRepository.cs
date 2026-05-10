using JosephQuiz.Domain.Entities;

namespace JosephQuiz.Application.Common.Interfaces;

public interface ICompetitiveSessionRepository
{
    Task AddAsync(CompetitiveSession session, CancellationToken cancellationToken);
}

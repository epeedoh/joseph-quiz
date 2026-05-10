using JosephQuiz.Domain.Entities;
using JosephQuiz.Domain.Enums;

namespace JosephQuiz.Application.Common.Interfaces;

public interface IQuestionRepository
{
    Task<List<Question>> GetActiveByZoneAsync(BiblicalZone zone, CancellationToken cancellationToken);

    Task<List<Question>> GetActiveByChaptersAsync(int chapterStart, int chapterEnd, CancellationToken cancellationToken);

    Task<List<Question>> GetActiveByIdsAsync(IEnumerable<Guid> ids, CancellationToken cancellationToken);

    Task<List<Question>> GetAllActiveAsync(CancellationToken cancellationToken);

    Task<bool> AnyAsync(CancellationToken cancellationToken);

    Task AddRangeAsync(IEnumerable<Question> questions, CancellationToken cancellationToken);
}

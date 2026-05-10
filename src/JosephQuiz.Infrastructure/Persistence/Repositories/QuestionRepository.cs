using JosephQuiz.Application.Common.Interfaces;
using JosephQuiz.Domain.Entities;
using JosephQuiz.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace JosephQuiz.Infrastructure.Persistence.Repositories;

public sealed class QuestionRepository(JosephQuizDbContext dbContext) : IQuestionRepository
{
    public Task<bool> AnyAsync(CancellationToken cancellationToken)
        => dbContext.Questions.AnyAsync(cancellationToken);

    public async Task AddRangeAsync(IEnumerable<Question> questions, CancellationToken cancellationToken)
        => await dbContext.Questions.AddRangeAsync(questions, cancellationToken);

    public Task<List<Question>> GetActiveByZoneAsync(BiblicalZone zone, CancellationToken cancellationToken)
        => dbContext.Questions
            .AsNoTracking()
            .Where(question => question.IsActive && question.Zone == zone)
            .OrderBy(question => question.Chapter)
            .ThenBy(question => question.Difficulty)
            .ToListAsync(cancellationToken);

    public Task<List<Question>> GetActiveByChaptersAsync(int chapterStart, int chapterEnd, CancellationToken cancellationToken)
        => dbContext.Questions
            .AsNoTracking()
            .Where(question => question.IsActive && question.Chapter >= chapterStart && question.Chapter <= chapterEnd)
            .OrderBy(question => question.Chapter)
            .ThenBy(question => question.Difficulty)
            .ToListAsync(cancellationToken);

    public Task<List<Question>> GetActiveByIdsAsync(IEnumerable<Guid> ids, CancellationToken cancellationToken)
    {
        var idList = ids.Distinct().ToList();
        return dbContext.Questions
            .Where(question => question.IsActive && idList.Contains(question.Id))
            .ToListAsync(cancellationToken);
    }

    public Task<List<Question>> GetAllActiveAsync(CancellationToken cancellationToken)
        => dbContext.Questions
            .AsNoTracking()
            .Where(question => question.IsActive)
            .OrderBy(question => question.Chapter)
            .ThenBy(question => question.Difficulty)
            .ToListAsync(cancellationToken);
}

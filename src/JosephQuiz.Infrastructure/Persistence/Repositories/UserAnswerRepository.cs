using JosephQuiz.Application.Common.Interfaces;
using JosephQuiz.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace JosephQuiz.Infrastructure.Persistence.Repositories;

public sealed class UserAnswerRepository(JosephQuizDbContext dbContext) : IUserAnswerRepository
{
    public async Task AddRangeAsync(IEnumerable<UserAnswer> answers, CancellationToken cancellationToken)
        => await dbContext.UserAnswers.AddRangeAsync(answers, cancellationToken);

    public Task<List<UserAnswer>> GetByProfileAsync(Guid profileId, CancellationToken cancellationToken)
        => dbContext.UserAnswers
            .AsNoTracking()
            .Include(answer => answer.Question)
            .Where(answer => answer.ProfileId == profileId)
            .OrderByDescending(answer => answer.AnsweredAtUtc)
            .ToListAsync(cancellationToken);

    public Task<List<UserAnswer>> GetIncorrectByProfileAsync(Guid profileId, CancellationToken cancellationToken)
        => dbContext.UserAnswers
            .AsNoTracking()
            .Where(answer => answer.ProfileId == profileId && !answer.IsCorrect)
            .OrderByDescending(answer => answer.AnsweredAtUtc)
            .ToListAsync(cancellationToken);

    public async Task<HashSet<Guid>> GetAnsweredQuestionIdsAsync(Guid profileId, CancellationToken cancellationToken)
        => (await dbContext.UserAnswers
                .AsNoTracking()
                .Where(answer => answer.ProfileId == profileId)
                .Select(answer => answer.QuestionId)
                .Distinct()
                .ToListAsync(cancellationToken))
            .ToHashSet();
}

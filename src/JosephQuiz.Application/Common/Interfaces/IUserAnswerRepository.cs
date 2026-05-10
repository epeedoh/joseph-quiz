using JosephQuiz.Domain.Entities;

namespace JosephQuiz.Application.Common.Interfaces;

public interface IUserAnswerRepository
{
    Task AddRangeAsync(IEnumerable<UserAnswer> answers, CancellationToken cancellationToken);

    Task<List<UserAnswer>> GetByProfileAsync(Guid profileId, CancellationToken cancellationToken);

    Task<List<UserAnswer>> GetIncorrectByProfileAsync(Guid profileId, CancellationToken cancellationToken);

    Task<HashSet<Guid>> GetAnsweredQuestionIdsAsync(Guid profileId, CancellationToken cancellationToken);
}

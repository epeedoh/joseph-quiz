using JosephQuiz.Application.Contracts.Requests;
using JosephQuiz.Domain.Entities;

namespace JosephQuiz.Application.Common.Interfaces;

public interface IQuizSelectionService
{
    Task<IReadOnlyList<Question>> BuildQuizAsync(QuizSelectionRequest request, CancellationToken cancellationToken);
}

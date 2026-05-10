using JosephQuiz.Application.Common.Interfaces;
using JosephQuiz.Application.Contracts.Requests;
using JosephQuiz.Domain.Entities;

namespace JosephQuiz.Infrastructure.Services;

public sealed class QuizSelectionService(
    IQuestionRepository questionRepository,
    IProfileRepository profileRepository,
    IUserAnswerRepository userAnswerRepository) : IQuizSelectionService
{
    public async Task<IReadOnlyList<Question>> BuildQuizAsync(QuizSelectionRequest request, CancellationToken cancellationToken)
    {
        var questions = await ResolveCandidateQuestionsAsync(request, cancellationToken);
        var profile = await profileRepository.GetByPseudoAsync(request.Pseudo, cancellationToken);
        if (profile is null)
        {
            return ShapeResult(questions, request);
        }

        var result = new List<Question>();
        var answeredQuestionIds = await userAnswerRepository.GetAnsweredQuestionIdsAsync(profile.Id, cancellationToken);

        if (request.IncludeErrors)
        {
            var incorrectQuestionIds = (await userAnswerRepository.GetIncorrectByProfileAsync(profile.Id, cancellationToken))
                .Select(answer => answer.QuestionId)
                .Distinct()
                .ToHashSet();

            result.AddRange(questions.Where(question => incorrectQuestionIds.Contains(question.Id)));
        }

        if (request.IncludeUnplayed)
        {
            result.AddRange(questions.Where(question => !answeredQuestionIds.Contains(question.Id)));
        }

        if (result.Count == 0)
        {
            result.AddRange(questions);
        }

        return ShapeResult(result.DistinctBy(question => question.Id).ToList(), request);
    }

    private async Task<List<Question>> ResolveCandidateQuestionsAsync(QuizSelectionRequest request, CancellationToken cancellationToken)
    {
        if (request.Chapter.HasValue)
        {
            return await questionRepository.GetActiveByChaptersAsync(request.Chapter.Value, request.Chapter.Value, cancellationToken);
        }

        if (request.ChapterStart.HasValue && request.ChapterEnd.HasValue)
        {
            return await questionRepository.GetActiveByChaptersAsync(request.ChapterStart.Value, request.ChapterEnd.Value, cancellationToken);
        }

        if (request.Zone.HasValue)
        {
            return await questionRepository.GetActiveByZoneAsync((JosephQuiz.Domain.Enums.BiblicalZone)request.Zone.Value, cancellationToken);
        }

        return await questionRepository.GetAllActiveAsync(cancellationToken);
    }

    private static IReadOnlyList<Question> ShapeResult(List<Question> questions, QuizSelectionRequest request)
    {
        var shaped = request.Shuffle
            ? questions.OrderBy(_ => Random.Shared.Next()).ToList()
            : questions.OrderBy(question => question.Chapter).ThenBy(question => question.Difficulty).ToList();

        return shaped.Take(request.Limit).ToList();
    }
}

using AutoMapper;
using JosephQuiz.Application.Common.Interfaces;
using JosephQuiz.Application.Contracts.Responses;
using MediatR;

namespace JosephQuiz.Application.Features.Questions.Queries.GetErrorQuestions;

public sealed record GetErrorQuestionsByPseudoQuery(string Pseudo) : IRequest<IReadOnlyList<QuestionDto>>;

public sealed class GetErrorQuestionsByPseudoQueryHandler(
    IProfileRepository profileRepository,
    IUserAnswerRepository userAnswerRepository,
    IQuestionRepository questionRepository,
    IMapper mapper) : IRequestHandler<GetErrorQuestionsByPseudoQuery, IReadOnlyList<QuestionDto>>
{
    public async Task<IReadOnlyList<QuestionDto>> Handle(GetErrorQuestionsByPseudoQuery request, CancellationToken cancellationToken)
    {
        var profile = await profileRepository.GetByPseudoAsync(request.Pseudo, cancellationToken);
        if (profile is null)
        {
            return [];
        }

        var incorrectAnswers = await userAnswerRepository.GetIncorrectByProfileAsync(profile.Id, cancellationToken);
        var questionIds = incorrectAnswers
            .Select(answer => answer.QuestionId)
            .Distinct()
            .ToList();

        if (questionIds.Count == 0)
        {
            return [];
        }

        var questions = await questionRepository.GetActiveByIdsAsync(questionIds, cancellationToken);
        return mapper.Map<IReadOnlyList<QuestionDto>>(questions);
    }
}

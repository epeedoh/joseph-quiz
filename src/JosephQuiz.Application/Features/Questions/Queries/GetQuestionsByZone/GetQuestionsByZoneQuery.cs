using AutoMapper;
using AutoMapper.QueryableExtensions;
using JosephQuiz.Application.Common.Interfaces;
using JosephQuiz.Application.Contracts.Responses;
using JosephQuiz.Domain.Enums;
using MediatR;

namespace JosephQuiz.Application.Features.Questions.Queries.GetQuestionsByZone;

public sealed record GetQuestionsByZoneQuery(BiblicalZone Zone) : IRequest<IReadOnlyList<QuestionDto>>;

public sealed class GetQuestionsByZoneQueryHandler(
    IQuestionRepository questionRepository,
    IMapper mapper) : IRequestHandler<GetQuestionsByZoneQuery, IReadOnlyList<QuestionDto>>
{
    public async Task<IReadOnlyList<QuestionDto>> Handle(GetQuestionsByZoneQuery request, CancellationToken cancellationToken)
    {
        var questions = await questionRepository.GetActiveByZoneAsync(request.Zone, cancellationToken);
        return mapper.Map<IReadOnlyList<QuestionDto>>(questions);
    }
}

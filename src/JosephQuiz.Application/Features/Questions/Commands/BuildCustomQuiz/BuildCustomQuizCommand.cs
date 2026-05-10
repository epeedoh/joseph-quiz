using AutoMapper;
using FluentValidation;
using JosephQuiz.Application.Common.Interfaces;
using JosephQuiz.Application.Contracts.Requests;
using JosephQuiz.Application.Contracts.Responses;
using MediatR;

namespace JosephQuiz.Application.Features.Questions.Commands.BuildCustomQuiz;

public sealed record BuildCustomQuizCommand(QuizSelectionRequest Payload) : IRequest<IReadOnlyList<QuestionDto>>;

public sealed class BuildCustomQuizCommandValidator : AbstractValidator<BuildCustomQuizCommand>
{
    public BuildCustomQuizCommandValidator()
    {
        RuleFor(command => command.Payload.Pseudo).NotEmpty().MaximumLength(40);
        RuleFor(command => command.Payload.Limit).InclusiveBetween(1, 50);
        RuleFor(command => command.Payload.Zone).InclusiveBetween(1, 4).When(command => command.Payload.Zone.HasValue);
        RuleFor(command => command.Payload.Chapter).InclusiveBetween(37, 50).When(command => command.Payload.Chapter.HasValue);
        RuleFor(command => command.Payload.ChapterStart).InclusiveBetween(37, 50).When(command => command.Payload.ChapterStart.HasValue);
        RuleFor(command => command.Payload.ChapterEnd).InclusiveBetween(37, 50).When(command => command.Payload.ChapterEnd.HasValue);
        RuleFor(command => command.Payload)
            .Must(payload => !payload.ChapterStart.HasValue || !payload.ChapterEnd.HasValue || payload.ChapterStart <= payload.ChapterEnd)
            .WithMessage("Le chapitre de début doit être inférieur ou égal au chapitre de fin.");
    }
}

public sealed class BuildCustomQuizCommandHandler(
    IQuizSelectionService quizSelectionService,
    IMapper mapper) : IRequestHandler<BuildCustomQuizCommand, IReadOnlyList<QuestionDto>>
{
    public async Task<IReadOnlyList<QuestionDto>> Handle(BuildCustomQuizCommand request, CancellationToken cancellationToken)
    {
        var questions = await quizSelectionService.BuildQuizAsync(request.Payload, cancellationToken);
        return mapper.Map<IReadOnlyList<QuestionDto>>(questions);
    }
}

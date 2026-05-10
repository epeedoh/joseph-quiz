using FluentValidation;
using JosephQuiz.Application.Common.Interfaces;
using JosephQuiz.Application.Common.Services;
using JosephQuiz.Application.Contracts.Requests;
using JosephQuiz.Application.Contracts.Responses;
using JosephQuiz.Shared.Constants;
using MediatR;

namespace JosephQuiz.Application.Features.Scores.Commands.SubmitCompetitiveScore;

public sealed record SubmitCompetitiveScoreCommand(CompetitiveScoreSubmissionRequest Payload) : IRequest<QuizResultDto>;

public sealed class SubmitCompetitiveScoreCommandValidator : AbstractValidator<SubmitCompetitiveScoreCommand>
{
    public SubmitCompetitiveScoreCommandValidator()
    {
        RuleFor(command => command.Payload.Pseudo).NotEmpty().MaximumLength(40);
        RuleFor(command => command.Payload.TimerSeconds).Must(timer => timer is 10 or 15 or 20);
        RuleFor(command => command.Payload.ChapterStart).InclusiveBetween(37, 50);
        RuleFor(command => command.Payload.ChapterEnd).InclusiveBetween(37, 50);
        RuleFor(command => command.Payload.Answers).NotEmpty();
    }
}

public sealed class SubmitCompetitiveScoreCommandHandler(
    IProfileRepository profileRepository,
    IQuestionRepository questionRepository,
    IUserAnswerRepository userAnswerRepository,
    IScoreRepository scoreRepository,
    ICompetitiveSessionRepository competitiveSessionRepository,
    IAdaptiveRecommendationService adaptiveRecommendationService,
    IUnitOfWork unitOfWork) : IRequestHandler<SubmitCompetitiveScoreCommand, QuizResultDto>
{
    public async Task<QuizResultDto> Handle(SubmitCompetitiveScoreCommand request, CancellationToken cancellationToken)
    {
        var profile = await profileRepository.GetOrCreateAsync(request.Payload.Pseudo, cancellationToken);
        var questions = await questionRepository.GetActiveByIdsAsync(request.Payload.Answers.Select(answer => answer.QuestionId), cancellationToken);
        var fastThreshold = Math.Min(QuizRules.FastAnswerThresholdMs, (request.Payload.TimerSeconds * 1_000) / 2);
        var evaluation = QuizScoringEngine.Evaluate(questions, request.Payload.Answers, fastThreshold);

        profile.TotalXp += evaluation.XpEarned;
        profile.TotalScore += evaluation.Score;
        profile.TotalCorrectAnswers += evaluation.CorrectAnswers;
        profile.TotalAnsweredQuestions += evaluation.TotalQuestions;
        profile.BestCombo = Math.Max(profile.BestCombo, evaluation.MaxCombo);
        profile.AverageResponseTimeMs = profile.TotalAnsweredQuestions == evaluation.TotalQuestions
            ? evaluation.AverageResponseTimeMs
            : ((profile.AverageResponseTimeMs * (profile.TotalAnsweredQuestions - evaluation.TotalQuestions)) +
               (evaluation.AverageResponseTimeMs * evaluation.TotalQuestions)) / profile.TotalAnsweredQuestions;
        profile.LastSeenAtUtc = DateTimeOffset.UtcNow;
        profile.UpdatedAtUtc = DateTimeOffset.UtcNow;

        var activeMembership = profile.TeamMemberships
            .OrderByDescending(membership => membership.JoinedAtUtc)
            .FirstOrDefault();

        if (activeMembership?.Team is not null)
        {
            activeMembership.ContributionScore += evaluation.Score;
            activeMembership.ContributionXp += evaluation.XpEarned;
            activeMembership.Team.TotalScore += evaluation.Score;
            activeMembership.Team.TotalXp += evaluation.XpEarned;
        }

        var zone = request.Payload.Zone.HasValue
            ? (JosephQuiz.Domain.Enums.BiblicalZone?)request.Payload.Zone.Value
            : null;

        await scoreRepository.AddAsync(new JosephQuiz.Domain.Entities.Score
        {
            ProfileId = profile.Id,
            Mode = JosephQuiz.Domain.Enums.QuizMode.Competition,
            Zone = zone,
            ChapterStart = request.Payload.ChapterStart,
            ChapterEnd = request.Payload.ChapterEnd,
            Points = evaluation.Score,
            XpEarned = evaluation.XpEarned,
            CorrectAnswers = evaluation.CorrectAnswers,
            TotalQuestions = evaluation.TotalQuestions,
            BonusPoints = evaluation.BonusPoints,
            MaxCombo = evaluation.MaxCombo,
            AverageResponseTimeMs = evaluation.AverageResponseTimeMs,
            CompletedAtUtc = DateTimeOffset.UtcNow
        }, cancellationToken);

        await competitiveSessionRepository.AddAsync(new JosephQuiz.Domain.Entities.CompetitiveSession
        {
            ProfileId = profile.Id,
            Zone = zone,
            ChapterStart = request.Payload.ChapterStart,
            ChapterEnd = request.Payload.ChapterEnd,
            TimerSeconds = request.Payload.TimerSeconds,
            FinalScore = evaluation.Score,
            XpEarned = evaluation.XpEarned,
            CorrectAnswers = evaluation.CorrectAnswers,
            TotalQuestions = evaluation.TotalQuestions,
            MaxCombo = evaluation.MaxCombo,
            BonusPoints = evaluation.BonusPoints,
            AverageResponseTimeMs = evaluation.AverageResponseTimeMs,
            StartedAtUtc = DateTimeOffset.UtcNow,
            EndedAtUtc = DateTimeOffset.UtcNow
        }, cancellationToken);

        await userAnswerRepository.AddRangeAsync(
            evaluation.Answers.Select(answer => new JosephQuiz.Domain.Entities.UserAnswer
            {
                ProfileId = profile.Id,
                QuestionId = answer.Question.Id,
                SelectedOption = answer.SelectedOption,
                IsCorrect = answer.IsCorrect,
                ResponseTimeMs = answer.ResponseTimeMs,
                Mode = JosephQuiz.Domain.Enums.QuizMode.Competition,
                AnsweredAtUtc = DateTimeOffset.UtcNow
            }),
            cancellationToken);

        await unitOfWork.SaveChangesAsync(cancellationToken);
        var recommendations = await adaptiveRecommendationService.BuildRecommendationsAsync(profile, cancellationToken);
        var level = ProgressionCalculator.ResolveLevel(profile.TotalXp);

        return new QuizResultDto(
            evaluation.Score,
            evaluation.XpEarned,
            evaluation.CorrectAnswers,
            evaluation.TotalQuestions,
            evaluation.MaxCombo,
            evaluation.FastAnswers,
            evaluation.Accuracy,
            level.Title,
            level.Badge,
            recommendations);
    }
}

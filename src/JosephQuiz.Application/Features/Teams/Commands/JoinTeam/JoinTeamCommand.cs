using FluentValidation;
using JosephQuiz.Application.Common.Interfaces;
using JosephQuiz.Application.Contracts.Requests;
using JosephQuiz.Application.Contracts.Responses;
using JosephQuiz.Domain.Entities;
using MediatR;

namespace JosephQuiz.Application.Features.Teams.Commands.JoinTeam;

public sealed record JoinTeamCommand(JoinTeamRequest Payload) : IRequest<TeamDto>;

public sealed class JoinTeamCommandValidator : AbstractValidator<JoinTeamCommand>
{
    public JoinTeamCommandValidator()
    {
        RuleFor(command => command.Payload.Pseudo).NotEmpty().MaximumLength(40);
        RuleFor(command => command.Payload.JoinCode).NotEmpty().Length(6);
    }
}

public sealed class JoinTeamCommandHandler(
    IProfileRepository profileRepository,
    ITeamRepository teamRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<JoinTeamCommand, TeamDto>
{
    public async Task<TeamDto> Handle(JoinTeamCommand request, CancellationToken cancellationToken)
    {
        var team = await teamRepository.GetByJoinCodeAsync(request.Payload.JoinCode.Trim().ToUpperInvariant(), cancellationToken)
            ?? throw new InvalidOperationException("Code d'équipe introuvable.");

        var profile = await profileRepository.GetOrCreateAsync(request.Payload.Pseudo, cancellationToken);
        var activeTeamNames = await profileRepository.GetActiveTeamNamesAsync(profile.Id, cancellationToken);
        if (activeTeamNames.TryGetValue(profile.Id, out var currentTeamName) && !string.IsNullOrWhiteSpace(currentTeamName))
        {
            throw new InvalidOperationException("Ce profil appartient déjà à une équipe.");
        }

        var member = new TeamMember
        {
            TeamId = team.Id,
            ProfileId = profile.Id
        };

        await teamRepository.AddMemberAsync(member, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new TeamDto(team.Id, team.Name, team.JoinCode, team.TotalScore, team.TotalXp, team.Members.Count + 1);
    }
}

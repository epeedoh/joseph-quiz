using FluentValidation;
using JosephQuiz.Application.Common.Interfaces;
using JosephQuiz.Application.Contracts.Requests;
using JosephQuiz.Application.Contracts.Responses;
using JosephQuiz.Domain.Entities;
using MediatR;

namespace JosephQuiz.Application.Features.Teams.Commands.CreateTeam;

public sealed record CreateTeamCommand(CreateTeamRequest Payload) : IRequest<TeamDto>;

public sealed class CreateTeamCommandValidator : AbstractValidator<CreateTeamCommand>
{
    public CreateTeamCommandValidator()
    {
        RuleFor(command => command.Payload.Pseudo).NotEmpty().MaximumLength(40);
        RuleFor(command => command.Payload.TeamName).NotEmpty().MinimumLength(3).MaximumLength(60);
    }
}

public sealed class CreateTeamCommandHandler(
    IProfileRepository profileRepository,
    ITeamRepository teamRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<CreateTeamCommand, TeamDto>
{
    public async Task<TeamDto> Handle(CreateTeamCommand request, CancellationToken cancellationToken)
    {
        var existingTeam = await teamRepository.GetByNameAsync(request.Payload.TeamName, cancellationToken);
        if (existingTeam is not null)
        {
            throw new InvalidOperationException("Une équipe porte déjà ce nom.");
        }

        var profile = await profileRepository.GetOrCreateAsync(request.Payload.Pseudo, cancellationToken);
        var activeTeamNames = await profileRepository.GetActiveTeamNamesAsync(profile.Id, cancellationToken);
        if (activeTeamNames.TryGetValue(profile.Id, out var currentTeamName) && !string.IsNullOrWhiteSpace(currentTeamName))
        {
            throw new InvalidOperationException("Ce profil appartient déjà à une équipe.");
        }

        var team = new Team
        {
            Name = request.Payload.TeamName.Trim(),
            JoinCode = GenerateJoinCode()
        };

        var member = new TeamMember
        {
            Team = team,
            Profile = profile,
            TeamId = team.Id,
            ProfileId = profile.Id
        };

        await teamRepository.AddAsync(team, cancellationToken);
        await teamRepository.AddMemberAsync(member, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new TeamDto(team.Id, team.Name, team.JoinCode, team.TotalScore, team.TotalXp, 1);
    }

    private static string GenerateJoinCode() => Convert.ToHexString(Guid.NewGuid().ToByteArray()[..3]);
}

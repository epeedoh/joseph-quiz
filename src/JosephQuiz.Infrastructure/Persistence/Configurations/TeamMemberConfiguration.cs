using JosephQuiz.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JosephQuiz.Infrastructure.Persistence.Configurations;

public sealed class TeamMemberConfiguration : IEntityTypeConfiguration<TeamMember>
{
    public void Configure(EntityTypeBuilder<TeamMember> builder)
    {
        builder.ToTable("TeamMembers");
        builder.HasKey(member => member.Id);
        builder.HasIndex(member => new { member.TeamId, member.ProfileId }).IsUnique();

        builder
            .HasOne(member => member.Team)
            .WithMany(team => team.Members)
            .HasForeignKey(member => member.TeamId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(member => member.Profile)
            .WithMany(profile => profile.TeamMemberships)
            .HasForeignKey(member => member.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

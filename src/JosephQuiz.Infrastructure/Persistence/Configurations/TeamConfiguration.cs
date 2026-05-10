using JosephQuiz.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JosephQuiz.Infrastructure.Persistence.Configurations;

public sealed class TeamConfiguration : IEntityTypeConfiguration<Team>
{
    public void Configure(EntityTypeBuilder<Team> builder)
    {
        builder.ToTable("Teams");
        builder.HasKey(team => team.Id);
        builder.Property(team => team.Name).HasMaxLength(60).IsRequired();
        builder.Property(team => team.JoinCode).HasMaxLength(6).IsRequired();
        builder.HasIndex(team => team.Name).IsUnique();
        builder.HasIndex(team => team.JoinCode).IsUnique();
    }
}

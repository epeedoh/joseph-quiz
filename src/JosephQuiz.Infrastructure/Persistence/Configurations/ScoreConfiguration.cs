using JosephQuiz.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JosephQuiz.Infrastructure.Persistence.Configurations;

public sealed class ScoreConfiguration : IEntityTypeConfiguration<Score>
{
    public void Configure(EntityTypeBuilder<Score> builder)
    {
        builder.ToTable("Scores");
        builder.HasKey(score => score.Id);
        builder.HasIndex(score => new { score.ProfileId, score.CompletedAtUtc });

        builder
            .HasOne(score => score.Profile)
            .WithMany(profile => profile.Scores)
            .HasForeignKey(score => score.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

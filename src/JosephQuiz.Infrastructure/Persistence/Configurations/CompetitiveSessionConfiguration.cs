using JosephQuiz.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JosephQuiz.Infrastructure.Persistence.Configurations;

public sealed class CompetitiveSessionConfiguration : IEntityTypeConfiguration<CompetitiveSession>
{
    public void Configure(EntityTypeBuilder<CompetitiveSession> builder)
    {
        builder.ToTable("CompetitiveSessions");
        builder.HasKey(session => session.Id);
        builder.HasIndex(session => new { session.ProfileId, session.EndedAtUtc });

        builder
            .HasOne(session => session.Profile)
            .WithMany(profile => profile.CompetitiveSessions)
            .HasForeignKey(session => session.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

using JosephQuiz.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JosephQuiz.Infrastructure.Persistence.Configurations;

public sealed class UserAnswerConfiguration : IEntityTypeConfiguration<UserAnswer>
{
    public void Configure(EntityTypeBuilder<UserAnswer> builder)
    {
        builder.ToTable("UserAnswers");
        builder.HasKey(answer => answer.Id);
        builder.Property(answer => answer.SelectedOption).HasMaxLength(1).IsRequired();
        builder.HasIndex(answer => new { answer.ProfileId, answer.QuestionId, answer.AnsweredAtUtc });

        builder
            .HasOne(answer => answer.Profile)
            .WithMany(profile => profile.UserAnswers)
            .HasForeignKey(answer => answer.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(answer => answer.Question)
            .WithMany(question => question.UserAnswers)
            .HasForeignKey(answer => answer.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

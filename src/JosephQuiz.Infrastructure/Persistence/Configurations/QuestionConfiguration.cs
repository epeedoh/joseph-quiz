using JosephQuiz.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JosephQuiz.Infrastructure.Persistence.Configurations;

public sealed class QuestionConfiguration : IEntityTypeConfiguration<Question>
{
    public void Configure(EntityTypeBuilder<Question> builder)
    {
        builder.ToTable("Questions");
        builder.HasKey(question => question.Id);
        builder.Property(question => question.Text).HasMaxLength(500).IsRequired();
        builder.Property(question => question.OptionA).HasMaxLength(250).IsRequired();
        builder.Property(question => question.OptionB).HasMaxLength(250).IsRequired();
        builder.Property(question => question.OptionC).HasMaxLength(250).IsRequired();
        builder.Property(question => question.OptionD).HasMaxLength(250).IsRequired();
        builder.Property(question => question.CorrectOption).HasMaxLength(1).IsRequired();
        builder.Property(question => question.VerseReference).HasMaxLength(100).IsRequired();
        builder.Property(question => question.VerseText).HasMaxLength(1200).IsRequired();
        builder.Property(question => question.Explanation).HasMaxLength(1200).IsRequired();
        builder.HasIndex(question => new { question.Zone, question.Chapter, question.Difficulty });
    }
}

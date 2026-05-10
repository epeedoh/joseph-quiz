using JosephQuiz.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JosephQuiz.Infrastructure.Persistence.Configurations;

public sealed class ProfileConfiguration : IEntityTypeConfiguration<Profile>
{
    public void Configure(EntityTypeBuilder<Profile> builder)
    {
        builder.ToTable("Profiles");
        builder.HasKey(profile => profile.Id);
        builder.Property(profile => profile.Pseudo).HasMaxLength(40).IsRequired();
        builder.HasIndex(profile => profile.Pseudo).IsUnique();
    }
}

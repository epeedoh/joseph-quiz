using JosephQuiz.Application.Common.Interfaces;
using JosephQuiz.Domain.Common;
using JosephQuiz.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace JosephQuiz.Infrastructure.Persistence;

public sealed class JosephQuizDbContext(DbContextOptions<JosephQuizDbContext> options)
    : DbContext(options), IUnitOfWork
{
    public DbSet<Question> Questions => Set<Question>();

    public DbSet<Profile> Profiles => Set<Profile>();

    public DbSet<Score> Scores => Set<Score>();

    public DbSet<UserAnswer> UserAnswers => Set<UserAnswer>();

    public DbSet<CompetitiveSession> CompetitiveSessions => Set<CompetitiveSession>();

    public DbSet<Team> Teams => Set<Team>();

    public DbSet<TeamMember> TeamMembers => Set<TeamMember>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(JosephQuizDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker
            .Entries<BaseEntity>()
            .Where(entry => entry.State is EntityState.Added or EntityState.Modified);

        foreach (var entry in entries)
        {
            entry.Entity.UpdatedAtUtc = DateTimeOffset.UtcNow;
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAtUtc = DateTimeOffset.UtcNow;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace JosephQuiz.Infrastructure.Persistence;

public sealed class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<JosephQuizDbContext>
{
    public JosephQuizDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("JOSEPHQUIZ_DB")
            ?? "Host=localhost;Port=5433;Database=josephquiz;Username=postgres;Password=postgres";

        var builder = new DbContextOptionsBuilder<JosephQuizDbContext>();
        builder.UseNpgsql(connectionString, options => options.MigrationsAssembly(typeof(JosephQuizDbContext).Assembly.FullName));

        return new JosephQuizDbContext(builder.Options);
    }
}

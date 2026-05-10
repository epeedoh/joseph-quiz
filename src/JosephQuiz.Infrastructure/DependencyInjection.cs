using JosephQuiz.Application.Common.Interfaces;
using JosephQuiz.Infrastructure.Persistence;
using JosephQuiz.Infrastructure.Persistence.Repositories;
using JosephQuiz.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace JosephQuiz.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("La chaîne de connexion 'DefaultConnection' est introuvable.");

        services.AddDbContext<JosephQuizDbContext>(options =>
            options.UseNpgsql(connectionString, builder => builder.MigrationsAssembly(typeof(JosephQuizDbContext).Assembly.FullName)));

        services.AddScoped<IUnitOfWork>(provider => provider.GetRequiredService<JosephQuizDbContext>());
        services.AddScoped<IQuestionRepository, QuestionRepository>();
        services.AddScoped<IProfileRepository, ProfileRepository>();
        services.AddScoped<IScoreRepository, ScoreRepository>();
        services.AddScoped<IUserAnswerRepository, UserAnswerRepository>();
        services.AddScoped<ITeamRepository, TeamRepository>();
        services.AddScoped<ICompetitiveSessionRepository, CompetitiveSessionRepository>();
        services.AddScoped<IQuizSelectionService, QuizSelectionService>();
        services.AddScoped<IAdaptiveRecommendationService, AdaptiveRecommendationService>();
        services.AddScoped<JosephQuizSeeder>();

        return services;
    }
}

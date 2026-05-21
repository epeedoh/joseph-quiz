using System.Text.Json.Serialization;
using FluentValidation;
using JosephQuiz.Application;
using JosephQuiz.Application.Contracts.Requests;
using JosephQuiz.Application.Features.Leaderboards.Queries.GetLeaderboard;
using JosephQuiz.Application.Features.Profiles.Queries.GetProfile;
using JosephQuiz.Application.Features.Questions.Commands.BuildCustomQuiz;
using JosephQuiz.Application.Features.Questions.Queries.GetErrorQuestions;
using JosephQuiz.Application.Features.Questions.Queries.GetQuestionsByZone;
using JosephQuiz.Application.Features.Scores.Commands.SubmitCompetitiveScore;
using JosephQuiz.Application.Features.Scores.Commands.SubmitScore;
using JosephQuiz.Application.Features.Teams.Commands.CreateTeam;
using JosephQuiz.Application.Features.Teams.Commands.JoinTeam;
using JosephQuiz.Application.Features.Teams.Queries.GetTeamLeaderboard;
using JosephQuiz.Domain.Enums;
using JosephQuiz.Infrastructure;
using JosephQuiz.Infrastructure.Persistence;
using MediatR;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, services, configuration) =>
{
    configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .WriteTo.Console();
});

builder.Services.AddProblemDetails();
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("JosephQuizCors", policy =>
    {
        var configuredOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
        var normalizedOrigins = configuredOrigins
            .Where(origin => !string.IsNullOrWhiteSpace(origin))
            .Select(origin => origin.Trim().TrimEnd('/'))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        policy
            .SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrWhiteSpace(origin))
                {
                    return false;
                }

                var normalizedOrigin = origin.Trim().TrimEnd('/');
                if (normalizedOrigins.Contains(normalizedOrigin))
                {
                    return true;
                }

                if (!Uri.TryCreate(normalizedOrigin, UriKind.Absolute, out var uri))
                {
                    return false;
                }

                return uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase)
                    || uri.Host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase)
                    || uri.Host.EndsWith(".onrender.com", StringComparison.OrdinalIgnoreCase);
            })
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseSerilogRequestLogging();
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
        var (statusCode, title, errors) = exception switch
        {
            ValidationException validationException => (StatusCodes.Status400BadRequest, "Validation échouée", validationException.Errors
                .GroupBy(error => error.PropertyName)
                .ToDictionary(group => group.Key, group => group.Select(error => error.ErrorMessage).ToArray())),
            InvalidOperationException invalidOperationException => (StatusCodes.Status400BadRequest, invalidOperationException.Message, new Dictionary<string, string[]>()),
            _ => (StatusCodes.Status500InternalServerError, "Une erreur interne est survenue.", new Dictionary<string, string[]>())
        };

        context.Response.StatusCode = statusCode;
        await context.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = statusCode == 500 ? exception?.Message : null,
            Extensions = { ["errors"] = errors }
        });
    });
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.DocumentTitle = "JOSEPH QUIZ API";
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "JOSEPH QUIZ API v1");
    });
}
else
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("JosephQuizCors");

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");
    var dbContext = services.GetRequiredService<JosephQuizDbContext>();

    try
    {
        await dbContext.Database.MigrateAsync();
        await services.GetRequiredService<JosephQuizSeeder>().SeedAsync();
        logger.LogInformation("JOSEPH QUIZ API initialisée.");
    }
    catch (PostgresException exception) when (exception.SqlState == PostgresErrorCodes.InvalidPassword)
    {
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? string.Empty;
        var builderConnection = new NpgsqlConnectionStringBuilder(connectionString);

        logger.LogCritical(
            exception,
            "Échec d'authentification PostgreSQL pour l'utilisateur '{Username}' sur {Host}:{Port}/{Database}. " +
            "En développement, la configuration par défaut attend la base Docker locale sur localhost:5433 avec postgres/postgres. " +
            "Sinon, définissez ConnectionStrings__DefaultConnection avec vos vrais identifiants.",
            builderConnection.Username,
            builderConnection.Host,
            builderConnection.Port,
            builderConnection.Database);

        throw new InvalidOperationException(
            "Connexion PostgreSQL refusée: mot de passe invalide. " +
            "Solution rapide: lance `docker compose up -d postgres` puis relance l'API, " +
            "ou remplace `ConnectionStrings__DefaultConnection` par les identifiants réels de votre PostgreSQL.",
            exception);
    }
}

app.MapGet("/", () => Results.Ok(new
{
    name = "JOSEPH QUIZ API",
    version = "1.0.0",
    status = "ready"
}))
.WithTags("Health");

app.MapGet("/health", async (JosephQuizDbContext dbContext) =>
{
    var canConnect = await dbContext.Database.CanConnectAsync();
    return Results.Ok(new { status = canConnect ? "healthy" : "degraded" });
})
.WithTags("Health");

app.MapGet("/questions/{zone:int}", async (int zone, ISender sender) =>
{
    if (!Enum.IsDefined(typeof(BiblicalZone), zone))
    {
        return Results.BadRequest(new { message = "Zone invalide." });
    }

    var result = await sender.Send(new GetQuestionsByZoneQuery((BiblicalZone)zone));
    return Results.Ok(result);
})
.WithName("GetQuestionsByZone")
.WithTags("Questions")
.WithOpenApi();

app.MapGet("/questions/errors/{pseudo}", async (string pseudo, ISender sender)
        => Results.Ok(await sender.Send(new GetErrorQuestionsByPseudoQuery(pseudo))))
    .WithName("GetErrorQuestions")
    .WithTags("Questions")
    .WithOpenApi();

app.MapPost("/quiz/custom", async (QuizSelectionRequest request, ISender sender)
        => Results.Ok(await sender.Send(new BuildCustomQuizCommand(request))))
    .WithName("BuildCustomQuiz")
    .WithTags("Quiz")
    .WithOpenApi();

app.MapPost("/submit-score", async (ScoreSubmissionRequest request, ISender sender)
        => Results.Ok(await sender.Send(new SubmitScoreCommand(request))))
    .WithName("SubmitScore")
    .WithTags("Scores")
    .WithOpenApi();

app.MapPost("/submit-competitive-score", async (CompetitiveScoreSubmissionRequest request, ISender sender)
        => Results.Ok(await sender.Send(new SubmitCompetitiveScoreCommand(request))))
    .WithName("SubmitCompetitiveScore")
    .WithTags("Scores")
    .WithOpenApi();

app.MapGet("/leaderboard", async (int? take, ISender sender)
        => Results.Ok(await sender.Send(new GetLeaderboardQuery(take ?? 20))))
    .WithName("GetLeaderboard")
    .WithTags("Leaderboards")
    .WithOpenApi();

app.MapGet("/teams/leaderboard", async (int? take, ISender sender)
        => Results.Ok(await sender.Send(new GetTeamLeaderboardQuery(take ?? 20))))
    .WithName("GetTeamsLeaderboard")
    .WithTags("Teams")
    .WithOpenApi();

app.MapPost("/teams/create", async (CreateTeamRequest request, ISender sender)
        => Results.Ok(await sender.Send(new CreateTeamCommand(request))))
    .WithName("CreateTeam")
    .WithTags("Teams")
    .WithOpenApi();

app.MapPost("/teams/join", async (JoinTeamRequest request, ISender sender)
        => Results.Ok(await sender.Send(new JoinTeamCommand(request))))
    .WithName("JoinTeam")
    .WithTags("Teams")
    .WithOpenApi();

app.MapGet("/profile/{pseudo}", async (string pseudo, ISender sender)
        => Results.Ok(await sender.Send(new GetProfileQuery(pseudo))))
    .WithName("GetProfile")
    .WithTags("Profiles")
    .WithOpenApi();

app.Run();

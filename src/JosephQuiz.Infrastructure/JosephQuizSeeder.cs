using System.Text.Json;
using JosephQuiz.Application.Common.Interfaces;
using JosephQuiz.Domain.Entities;
using JosephQuiz.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace JosephQuiz.Infrastructure;

public sealed class JosephQuizSeeder(
    IQuestionRepository questionRepository,
    IUnitOfWork unitOfWork,
    ILogger<JosephQuizSeeder> logger)
{
    private static readonly JsonSerializerOptions SeedSerializerOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        if (await questionRepository.AnyAsync(cancellationToken))
        {
            logger.LogInformation("Les questions Joseph Quiz existent déjà. Aucun seed nécessaire.");
            return;
        }

        var seedPath = Path.Combine(AppContext.BaseDirectory, "SeedData", "joseph-questions.json");
        if (!File.Exists(seedPath))
        {
            throw new FileNotFoundException("Le fichier de seed des questions est introuvable.", seedPath);
        }

        await using var stream = File.OpenRead(seedPath);
        var items = await JsonSerializer.DeserializeAsync<List<QuestionSeedItem>>(
                stream,
                SeedSerializerOptions,
                cancellationToken)
            ?? [];

        var questions = items.Select((item, index) => new Question
        {
            Text = item.Text,
            OptionA = item.OptionA,
            OptionB = item.OptionB,
            OptionC = item.OptionC,
            OptionD = item.OptionD,
            CorrectOption = item.CorrectOption,
            VerseReference = item.VerseReference,
            VerseText = item.VerseText,
            Explanation = item.Explanation,
            Chapter = item.Chapter,
            Zone = ParseEnum<BiblicalZone>(item.Zone, nameof(item.Zone), index),
            Difficulty = ParseEnum<DifficultyLevel>(item.Difficulty, nameof(item.Difficulty), index),
            IsActive = true
        }).ToList();

        await questionRepository.AddRangeAsync(questions, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        logger.LogInformation("{Count} questions Joseph Quiz ont été injectées.", items.Count);
    }

    private static TEnum ParseEnum<TEnum>(string value, string fieldName, int index)
        where TEnum : struct, Enum
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new InvalidOperationException(
                $"Le champ '{fieldName}' est vide pour l'élément de seed #{index + 1}.");
        }

        if (Enum.TryParse<TEnum>(value, ignoreCase: true, out var parsedValue))
        {
            return parsedValue;
        }

        throw new InvalidOperationException(
            $"Le champ '{fieldName}' contient la valeur invalide '{value}' pour l'élément de seed #{index + 1}.");
    }

    private sealed class QuestionSeedItem
    {
        public string Text { get; init; } = string.Empty;
        public string OptionA { get; init; } = string.Empty;
        public string OptionB { get; init; } = string.Empty;
        public string OptionC { get; init; } = string.Empty;
        public string OptionD { get; init; } = string.Empty;
        public string CorrectOption { get; init; } = string.Empty;
        public string VerseReference { get; init; } = string.Empty;
        public string VerseText { get; init; } = string.Empty;
        public string Explanation { get; init; } = string.Empty;
        public int Chapter { get; init; }
        public string Zone { get; init; } = string.Empty;
        public string Difficulty { get; init; } = string.Empty;
    }
}

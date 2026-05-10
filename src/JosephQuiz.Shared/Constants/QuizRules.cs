using JosephQuiz.Shared.Models;

namespace JosephQuiz.Shared.Constants;

public static class QuizRules
{
    public const int CorrectAnswerXp = 10;
    public const int FastAnswerXp = 5;
    public const int ChapterCompletionXp = 50;
    public const int FastAnswerThresholdMs = 7_000;

    public static readonly IReadOnlyList<LevelDescriptor> Levels =
    [
        new("Rêveur Novice", "🥉 Rêveur", 0, 100),
        new("Intendant", "🥈 Intendant", 101, 300),
        new("Gouverneur", "🥇 Gouverneur", 301, 600),
        new("Patriarche", "🏆 Patriarche", 601, null)
    ];

    public static readonly IReadOnlyList<ZoneDescriptor> Zones =
    [
        new(1, "zone-1", "Les rêves et la trahison", 37, 38, "golden-dream"),
        new(2, "zone-2", "Prison et élévation", 39, 41, "royal-rise"),
        new(3, "zone-3", "Tests et réconciliation", 42, 45, "mercy-trial"),
        new(4, "zone-4", "Héritage et fin de vie", 46, 50, "legacy-light")
    ];

    public static LevelDescriptor ResolveLevel(int xp)
        => Levels.First(level =>
            xp >= level.MinimumXp &&
            (level.MaximumXp is null || xp <= level.MaximumXp.Value));
}

using JosephQuiz.Application.Common.Interfaces;
using JosephQuiz.Application.Contracts.Responses;
using JosephQuiz.Domain.Entities;

namespace JosephQuiz.Infrastructure.Services;

public sealed class AdaptiveRecommendationService(
    IUserAnswerRepository userAnswerRepository) : IAdaptiveRecommendationService
{
    public async Task<IReadOnlyList<AdaptiveRecommendationDto>> BuildRecommendationsAsync(Profile profile, CancellationToken cancellationToken)
    {
        var answers = await userAnswerRepository.GetByProfileAsync(profile.Id, cancellationToken);
        if (answers.Count == 0)
        {
            return
            [
                new AdaptiveRecommendationDto(
                    "Commencer par la Zone 1",
                    "Démarre avec les rêves et la trahison pour construire une base narrative solide.",
                    1,
                    37,
                    38,
                    "Fondations du récit"),
                new AdaptiveRecommendationDto(
                    "Révision rapide 10 questions",
                    "Un format court aide à lancer le rythme sans pression.",
                    null,
                    37,
                    50,
                    "Démarrage progressif")
            ];
        }

        var byZone = answers
            .GroupBy(answer => answer.Question.Zone)
            .Select(group => new
            {
                Zone = (int)group.Key,
                Accuracy = group.Count(answer => answer.IsCorrect) / (double)group.Count()
            })
            .OrderBy(item => item.Accuracy)
            .First();

        var repeatedErrors = answers
            .Where(answer => !answer.IsCorrect)
            .GroupBy(answer => answer.Question.Chapter)
            .Select(group => new
            {
                Chapter = group.Key,
                Errors = group.Count()
            })
            .OrderByDescending(item => item.Errors)
            .FirstOrDefault();

        var slowChapter = answers
            .GroupBy(answer => answer.Question.Chapter)
            .Select(group => new
            {
                Chapter = group.Key,
                AverageResponse = group.Average(answer => answer.ResponseTimeMs)
            })
            .OrderByDescending(item => item.AverageResponse)
            .First();

        var recommendations = new List<AdaptiveRecommendationDto>
        {
            new(
                "Renforcer la zone la plus fragile",
                $"Ta précision la plus basse se situe en zone {byZone.Zone}. Un entraînement ciblé aidera à corriger les automatismes.",
                byZone.Zone,
                null,
                null,
                "Zone faible")
        };

        if (repeatedErrors is not null)
        {
            recommendations.Add(new AdaptiveRecommendationDto(
                "Revoir les erreurs fréquentes",
                $"Le chapitre {repeatedErrors.Chapter} concentre le plus d'erreurs récentes.",
                null,
                repeatedErrors.Chapter,
                repeatedErrors.Chapter,
                "Mémorisation des détails"));
        }

        recommendations.Add(new AdaptiveRecommendationDto(
            "Accélérer la prise de décision",
            $"Tes réponses sont les plus lentes au chapitre {slowChapter.Chapter}. Un quiz chrono court peut améliorer les réflexes.",
            null,
            slowChapter.Chapter,
            slowChapter.Chapter,
            "Vitesse de réponse"));

        return recommendations;
    }
}

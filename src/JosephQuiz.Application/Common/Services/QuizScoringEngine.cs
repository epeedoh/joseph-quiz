using JosephQuiz.Application.Common.Models;
using JosephQuiz.Application.Contracts.Requests;
using JosephQuiz.Domain.Entities;

namespace JosephQuiz.Application.Common.Services;

public static class QuizScoringEngine
{
    public static QuizEvaluationResult Evaluate(
        IReadOnlyCollection<Question> questions,
        IReadOnlyList<AnswerSubmissionDto> submissions,
        int fastThresholdMs)
    {
        var questionMap = questions.ToDictionary(question => question.Id);
        var evaluatedAnswers = new List<EvaluatedAnswerResult>(submissions.Count);
        var correctAnswers = 0;
        var fastAnswers = 0;
        var currentCombo = 0;
        var maxCombo = 0;
        var comboBonus = 0;
        var totalResponseTime = 0d;

        foreach (var submission in submissions)
        {
            if (!questionMap.TryGetValue(submission.QuestionId, out var question))
            {
                continue;
            }

            var selectedOption = submission.SelectedOption.Trim().ToUpperInvariant();
            var isCorrect = string.Equals(question.CorrectOption, selectedOption, StringComparison.OrdinalIgnoreCase);
            var isFast = isCorrect && submission.ResponseTimeMs <= fastThresholdMs;

            if (isCorrect)
            {
                correctAnswers++;
                currentCombo++;
                maxCombo = Math.Max(maxCombo, currentCombo);
                if (currentCombo >= 2)
                {
                    comboBonus += currentCombo * 5;
                }
            }
            else
            {
                currentCombo = 0;
            }

            if (isFast)
            {
                fastAnswers++;
            }

            totalResponseTime += submission.ResponseTimeMs;
            evaluatedAnswers.Add(new EvaluatedAnswerResult(question, selectedOption, isCorrect, isFast, submission.ResponseTimeMs));
        }

        var chapterBonusCount = questions.Select(question => question.Chapter).Distinct().Count() == 1 ? 1 : 0;
        var xpEarned = ProgressionCalculator.CalculateXp(correctAnswers, fastAnswers, chapterBonusCount, maxCombo);
        var scoreBonus = (fastAnswers * 25) + comboBonus + (chapterBonusCount * 150);
        var score = (correctAnswers * 100) + scoreBonus;
        var totalQuestions = submissions.Count;
        var accuracy = totalQuestions == 0 ? 0d : (double)correctAnswers / totalQuestions;
        var averageResponseTimeMs = totalQuestions == 0 ? 0d : totalResponseTime / totalQuestions;

        return new QuizEvaluationResult(
            score,
            xpEarned,
            correctAnswers,
            totalQuestions,
            maxCombo,
            fastAnswers,
            scoreBonus,
            chapterBonusCount,
            accuracy,
            averageResponseTimeMs,
            evaluatedAnswers);
    }
}

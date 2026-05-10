namespace JosephQuiz.Application.Contracts.Responses;

public sealed record QuestionDto(
    Guid Id,
    string Text,
    IReadOnlyList<QuestionOptionDto> Options,
    string CorrectOption,
    string VerseReference,
    string VerseText,
    string Explanation,
    int Chapter,
    int Zone,
    string Difficulty);

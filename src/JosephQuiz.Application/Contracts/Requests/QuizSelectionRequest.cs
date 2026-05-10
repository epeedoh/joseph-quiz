namespace JosephQuiz.Application.Contracts.Requests;

public sealed record QuizSelectionRequest(
    string Pseudo,
    int? Zone,
    int? Chapter,
    int? ChapterStart,
    int? ChapterEnd,
    bool IncludeErrors,
    bool IncludeUnplayed,
    int Limit,
    bool Shuffle = true);

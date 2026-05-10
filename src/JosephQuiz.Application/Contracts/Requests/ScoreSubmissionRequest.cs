namespace JosephQuiz.Application.Contracts.Requests;

public sealed record ScoreSubmissionRequest(
    string Pseudo,
    int? Zone,
    int ChapterStart,
    int ChapterEnd,
    IReadOnlyList<AnswerSubmissionDto> Answers);

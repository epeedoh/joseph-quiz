namespace JosephQuiz.Application.Contracts.Requests;

public sealed record CompetitiveScoreSubmissionRequest(
    string Pseudo,
    int? Zone,
    int ChapterStart,
    int ChapterEnd,
    int TimerSeconds,
    IReadOnlyList<AnswerSubmissionDto> Answers);

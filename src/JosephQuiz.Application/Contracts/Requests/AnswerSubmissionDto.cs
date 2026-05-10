namespace JosephQuiz.Application.Contracts.Requests;

public sealed record AnswerSubmissionDto(Guid QuestionId, string SelectedOption, int ResponseTimeMs);

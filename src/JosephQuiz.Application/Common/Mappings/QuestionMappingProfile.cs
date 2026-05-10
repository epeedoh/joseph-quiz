using AutoMapper;
using JosephQuiz.Application.Contracts.Responses;
using JosephQuiz.Domain.Entities;
using AutoMapperProfile = AutoMapper.Profile;

namespace JosephQuiz.Application.Common.Mappings;

public sealed class QuestionMappingProfile : AutoMapperProfile
{
    public QuestionMappingProfile()
    {
        CreateMap<Question, QuestionDto>()
            .ConstructUsing(source => new QuestionDto(
                source.Id,
                source.Text,
                new List<QuestionOptionDto>
                {
                    new("A", source.OptionA),
                    new("B", source.OptionB),
                    new("C", source.OptionC),
                    new("D", source.OptionD)
                },
                source.CorrectOption,
                source.VerseReference,
                source.VerseText,
                source.Explanation,
                source.Chapter,
                (int)source.Zone,
                source.Difficulty.ToString()));

        CreateMap<Score, RecentScoreDto>()
            .ForMember(destination => destination.Mode, options => options.MapFrom(source => source.Mode.ToString()))
            .ForMember(destination => destination.Zone, options => options.MapFrom(source => source.Zone.HasValue ? (int?)source.Zone.Value : null));
    }
}

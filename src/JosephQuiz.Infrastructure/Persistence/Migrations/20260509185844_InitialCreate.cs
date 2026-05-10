using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JosephQuiz.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Profiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Pseudo = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    TotalXp = table.Column<int>(type: "integer", nullable: false),
                    TotalScore = table.Column<int>(type: "integer", nullable: false),
                    TotalCorrectAnswers = table.Column<int>(type: "integer", nullable: false),
                    TotalAnsweredQuestions = table.Column<int>(type: "integer", nullable: false),
                    BestCombo = table.Column<int>(type: "integer", nullable: false),
                    AverageResponseTimeMs = table.Column<double>(type: "double precision", nullable: false),
                    LastSeenAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Profiles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Questions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Text = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    OptionA = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    OptionB = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    OptionC = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    OptionD = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    CorrectOption = table.Column<string>(type: "character varying(1)", maxLength: 1, nullable: false),
                    VerseReference = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    VerseText = table.Column<string>(type: "character varying(1200)", maxLength: 1200, nullable: false),
                    Explanation = table.Column<string>(type: "character varying(1200)", maxLength: 1200, nullable: false),
                    Chapter = table.Column<int>(type: "integer", nullable: false),
                    Zone = table.Column<int>(type: "integer", nullable: false),
                    Difficulty = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Questions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Teams",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    JoinCode = table.Column<string>(type: "character varying(6)", maxLength: 6, nullable: false),
                    TotalScore = table.Column<int>(type: "integer", nullable: false),
                    TotalXp = table.Column<int>(type: "integer", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Teams", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CompetitiveSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    Zone = table.Column<int>(type: "integer", nullable: true),
                    ChapterStart = table.Column<int>(type: "integer", nullable: false),
                    ChapterEnd = table.Column<int>(type: "integer", nullable: false),
                    TimerSeconds = table.Column<int>(type: "integer", nullable: false),
                    FinalScore = table.Column<int>(type: "integer", nullable: false),
                    XpEarned = table.Column<int>(type: "integer", nullable: false),
                    CorrectAnswers = table.Column<int>(type: "integer", nullable: false),
                    TotalQuestions = table.Column<int>(type: "integer", nullable: false),
                    MaxCombo = table.Column<int>(type: "integer", nullable: false),
                    BonusPoints = table.Column<int>(type: "integer", nullable: false),
                    AverageResponseTimeMs = table.Column<double>(type: "double precision", nullable: false),
                    StartedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    EndedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompetitiveSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompetitiveSessions_Profiles_ProfileId",
                        column: x => x.ProfileId,
                        principalTable: "Profiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Scores",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    Mode = table.Column<int>(type: "integer", nullable: false),
                    Zone = table.Column<int>(type: "integer", nullable: true),
                    ChapterStart = table.Column<int>(type: "integer", nullable: false),
                    ChapterEnd = table.Column<int>(type: "integer", nullable: false),
                    Points = table.Column<int>(type: "integer", nullable: false),
                    XpEarned = table.Column<int>(type: "integer", nullable: false),
                    CorrectAnswers = table.Column<int>(type: "integer", nullable: false),
                    TotalQuestions = table.Column<int>(type: "integer", nullable: false),
                    BonusPoints = table.Column<int>(type: "integer", nullable: false),
                    MaxCombo = table.Column<int>(type: "integer", nullable: false),
                    AverageResponseTimeMs = table.Column<double>(type: "double precision", nullable: false),
                    CompletedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Scores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Scores_Profiles_ProfileId",
                        column: x => x.ProfileId,
                        principalTable: "Profiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserAnswers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    QuestionId = table.Column<Guid>(type: "uuid", nullable: false),
                    SelectedOption = table.Column<string>(type: "character varying(1)", maxLength: 1, nullable: false),
                    IsCorrect = table.Column<bool>(type: "boolean", nullable: false),
                    ResponseTimeMs = table.Column<int>(type: "integer", nullable: false),
                    Mode = table.Column<int>(type: "integer", nullable: false),
                    AnsweredAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserAnswers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserAnswers_Profiles_ProfileId",
                        column: x => x.ProfileId,
                        principalTable: "Profiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserAnswers_Questions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Questions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TeamMembers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TeamId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    ContributionScore = table.Column<int>(type: "integer", nullable: false),
                    ContributionXp = table.Column<int>(type: "integer", nullable: false),
                    JoinedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeamMembers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TeamMembers_Profiles_ProfileId",
                        column: x => x.ProfileId,
                        principalTable: "Profiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TeamMembers_Teams_TeamId",
                        column: x => x.TeamId,
                        principalTable: "Teams",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CompetitiveSessions_ProfileId_EndedAtUtc",
                table: "CompetitiveSessions",
                columns: new[] { "ProfileId", "EndedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_Profiles_Pseudo",
                table: "Profiles",
                column: "Pseudo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Questions_Zone_Chapter_Difficulty",
                table: "Questions",
                columns: new[] { "Zone", "Chapter", "Difficulty" });

            migrationBuilder.CreateIndex(
                name: "IX_Scores_ProfileId_CompletedAtUtc",
                table: "Scores",
                columns: new[] { "ProfileId", "CompletedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_TeamMembers_ProfileId",
                table: "TeamMembers",
                column: "ProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_TeamMembers_TeamId_ProfileId",
                table: "TeamMembers",
                columns: new[] { "TeamId", "ProfileId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Teams_JoinCode",
                table: "Teams",
                column: "JoinCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Teams_Name",
                table: "Teams",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserAnswers_ProfileId_QuestionId_AnsweredAtUtc",
                table: "UserAnswers",
                columns: new[] { "ProfileId", "QuestionId", "AnsweredAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_UserAnswers_QuestionId",
                table: "UserAnswers",
                column: "QuestionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CompetitiveSessions");

            migrationBuilder.DropTable(
                name: "Scores");

            migrationBuilder.DropTable(
                name: "TeamMembers");

            migrationBuilder.DropTable(
                name: "UserAnswers");

            migrationBuilder.DropTable(
                name: "Teams");

            migrationBuilder.DropTable(
                name: "Profiles");

            migrationBuilder.DropTable(
                name: "Questions");
        }
    }
}

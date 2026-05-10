CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;

CREATE TABLE "Profiles" (
    "Id" uuid NOT NULL,
    "Pseudo" character varying(40) NOT NULL,
    "TotalXp" integer NOT NULL,
    "TotalScore" integer NOT NULL,
    "TotalCorrectAnswers" integer NOT NULL,
    "TotalAnsweredQuestions" integer NOT NULL,
    "BestCombo" integer NOT NULL,
    "AverageResponseTimeMs" double precision NOT NULL,
    "LastSeenAtUtc" timestamp with time zone NOT NULL,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    "UpdatedAtUtc" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Profiles" PRIMARY KEY ("Id")
);

CREATE TABLE "Questions" (
    "Id" uuid NOT NULL,
    "Text" character varying(500) NOT NULL,
    "OptionA" character varying(250) NOT NULL,
    "OptionB" character varying(250) NOT NULL,
    "OptionC" character varying(250) NOT NULL,
    "OptionD" character varying(250) NOT NULL,
    "CorrectOption" character varying(1) NOT NULL,
    "VerseReference" character varying(100) NOT NULL,
    "VerseText" character varying(1200) NOT NULL,
    "Explanation" character varying(1200) NOT NULL,
    "Chapter" integer NOT NULL,
    "Zone" integer NOT NULL,
    "Difficulty" integer NOT NULL,
    "IsActive" boolean NOT NULL,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    "UpdatedAtUtc" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Questions" PRIMARY KEY ("Id")
);

CREATE TABLE "Teams" (
    "Id" uuid NOT NULL,
    "Name" character varying(60) NOT NULL,
    "JoinCode" character varying(6) NOT NULL,
    "TotalScore" integer NOT NULL,
    "TotalXp" integer NOT NULL,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    "UpdatedAtUtc" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Teams" PRIMARY KEY ("Id")
);

CREATE TABLE "CompetitiveSessions" (
    "Id" uuid NOT NULL,
    "ProfileId" uuid NOT NULL,
    "Zone" integer,
    "ChapterStart" integer NOT NULL,
    "ChapterEnd" integer NOT NULL,
    "TimerSeconds" integer NOT NULL,
    "FinalScore" integer NOT NULL,
    "XpEarned" integer NOT NULL,
    "CorrectAnswers" integer NOT NULL,
    "TotalQuestions" integer NOT NULL,
    "MaxCombo" integer NOT NULL,
    "BonusPoints" integer NOT NULL,
    "AverageResponseTimeMs" double precision NOT NULL,
    "StartedAtUtc" timestamp with time zone NOT NULL,
    "EndedAtUtc" timestamp with time zone NOT NULL,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    "UpdatedAtUtc" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_CompetitiveSessions" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_CompetitiveSessions_Profiles_ProfileId" FOREIGN KEY ("ProfileId") REFERENCES "Profiles" ("Id") ON DELETE CASCADE
);

CREATE TABLE "Scores" (
    "Id" uuid NOT NULL,
    "ProfileId" uuid NOT NULL,
    "Mode" integer NOT NULL,
    "Zone" integer,
    "ChapterStart" integer NOT NULL,
    "ChapterEnd" integer NOT NULL,
    "Points" integer NOT NULL,
    "XpEarned" integer NOT NULL,
    "CorrectAnswers" integer NOT NULL,
    "TotalQuestions" integer NOT NULL,
    "BonusPoints" integer NOT NULL,
    "MaxCombo" integer NOT NULL,
    "AverageResponseTimeMs" double precision NOT NULL,
    "CompletedAtUtc" timestamp with time zone NOT NULL,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    "UpdatedAtUtc" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Scores" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Scores_Profiles_ProfileId" FOREIGN KEY ("ProfileId") REFERENCES "Profiles" ("Id") ON DELETE CASCADE
);

CREATE TABLE "UserAnswers" (
    "Id" uuid NOT NULL,
    "ProfileId" uuid NOT NULL,
    "QuestionId" uuid NOT NULL,
    "SelectedOption" character varying(1) NOT NULL,
    "IsCorrect" boolean NOT NULL,
    "ResponseTimeMs" integer NOT NULL,
    "Mode" integer NOT NULL,
    "AnsweredAtUtc" timestamp with time zone NOT NULL,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    "UpdatedAtUtc" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_UserAnswers" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_UserAnswers_Profiles_ProfileId" FOREIGN KEY ("ProfileId") REFERENCES "Profiles" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_UserAnswers_Questions_QuestionId" FOREIGN KEY ("QuestionId") REFERENCES "Questions" ("Id") ON DELETE CASCADE
);

CREATE TABLE "TeamMembers" (
    "Id" uuid NOT NULL,
    "TeamId" uuid NOT NULL,
    "ProfileId" uuid NOT NULL,
    "ContributionScore" integer NOT NULL,
    "ContributionXp" integer NOT NULL,
    "JoinedAtUtc" timestamp with time zone NOT NULL,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    "UpdatedAtUtc" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_TeamMembers" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_TeamMembers_Profiles_ProfileId" FOREIGN KEY ("ProfileId") REFERENCES "Profiles" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_TeamMembers_Teams_TeamId" FOREIGN KEY ("TeamId") REFERENCES "Teams" ("Id") ON DELETE CASCADE
);

CREATE INDEX "IX_CompetitiveSessions_ProfileId_EndedAtUtc" ON "CompetitiveSessions" ("ProfileId", "EndedAtUtc");

CREATE UNIQUE INDEX "IX_Profiles_Pseudo" ON "Profiles" ("Pseudo");

CREATE INDEX "IX_Questions_Zone_Chapter_Difficulty" ON "Questions" ("Zone", "Chapter", "Difficulty");

CREATE INDEX "IX_Scores_ProfileId_CompletedAtUtc" ON "Scores" ("ProfileId", "CompletedAtUtc");

CREATE INDEX "IX_TeamMembers_ProfileId" ON "TeamMembers" ("ProfileId");

CREATE UNIQUE INDEX "IX_TeamMembers_TeamId_ProfileId" ON "TeamMembers" ("TeamId", "ProfileId");

CREATE UNIQUE INDEX "IX_Teams_JoinCode" ON "Teams" ("JoinCode");

CREATE UNIQUE INDEX "IX_Teams_Name" ON "Teams" ("Name");

CREATE INDEX "IX_UserAnswers_ProfileId_QuestionId_AnsweredAtUtc" ON "UserAnswers" ("ProfileId", "QuestionId", "AnsweredAtUtc");

CREATE INDEX "IX_UserAnswers_QuestionId" ON "UserAnswers" ("QuestionId");

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260509185844_InitialCreate', '8.0.4');

COMMIT;


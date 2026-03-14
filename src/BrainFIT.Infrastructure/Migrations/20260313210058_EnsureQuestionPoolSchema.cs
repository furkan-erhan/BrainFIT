using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BrainFIT.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EnsureQuestionPoolSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Idempotent: use raw SQL to add columns if they don't exist,
            // and create the QuizQuestions table if it doesn't exist.
            migrationBuilder.Sql(@"
                ALTER TABLE ""Questions"" ADD COLUMN IF NOT EXISTS ""Category"" text NULL;
                ALTER TABLE ""Questions"" ADD COLUMN IF NOT EXISTS ""DifficultyLevel"" integer NOT NULL DEFAULT 1;
                
                CREATE TABLE IF NOT EXISTS ""QuizQuestions"" (
                    ""QuizId"" uuid NOT NULL,
                    ""QuestionId"" uuid NOT NULL,
                    ""Id"" uuid NOT NULL,
                    ""CreatedDate"" timestamp with time zone NOT NULL DEFAULT now(),
                    ""UpdatedDate"" timestamp with time zone NULL,
                    ""IsDeleted"" boolean NOT NULL DEFAULT false,
                    CONSTRAINT ""PK_QuizQuestions"" PRIMARY KEY (""QuizId"", ""QuestionId""),
                    CONSTRAINT ""FK_QuizQuestions_Questions_QuestionId"" FOREIGN KEY (""QuestionId"") REFERENCES ""Questions"" (""Id"") ON DELETE CASCADE,
                    CONSTRAINT ""FK_QuizQuestions_Quizzes_QuizId"" FOREIGN KEY (""QuizId"") REFERENCES ""Quizzes"" (""Id"") ON DELETE CASCADE
                );
                
                CREATE INDEX IF NOT EXISTS ""IX_QuizQuestions_QuestionId"" ON ""QuizQuestions"" (""QuestionId"");
                
                -- Drop the old QuizId column from Questions if it still exists
                DO $$ BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Questions' AND column_name='QuizId') THEN
                        ALTER TABLE ""Questions"" DROP COLUMN ""QuizId"";
                    END IF;
                END $$;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "QuizQuestions");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "Questions");

            migrationBuilder.DropColumn(
                name: "DifficultyLevel",
                table: "Questions");

            migrationBuilder.AddColumn<Guid>(
                name: "QuizId",
                table: "Questions",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Questions_QuizId",
                table: "Questions",
                column: "QuizId");

            migrationBuilder.AddForeignKey(
                name: "FK_Questions_Quizzes_QuizId",
                table: "Questions",
                column: "QuizId",
                principalTable: "Quizzes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

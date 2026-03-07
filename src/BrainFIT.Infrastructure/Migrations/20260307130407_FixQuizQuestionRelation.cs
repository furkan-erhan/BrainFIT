using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BrainFIT.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixQuizQuestionRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Questions_Quizzes_Id",
                table: "Questions");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddForeignKey(
                name: "FK_Questions_Quizzes_Id",
                table: "Questions",
                column: "Id",
                principalTable: "Quizzes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

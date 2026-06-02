using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KuaforRandevu.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSalonApprovalStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ApprovalStatus",
                table: "Salons",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApprovalStatus",
                table: "Salons");
        }
    }
}

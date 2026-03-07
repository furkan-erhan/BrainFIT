using Microsoft.EntityFrameworkCore;
using BrainFIT.Infrastructure.Persistence;
using Microsoft.Extensions.Configuration;

var builder = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("src/BrainFIT.API/appsettings.json");

var configuration = builder.Build();
var connectionString = configuration.GetConnectionString("DefaultConnection");

var optionsBuilder = new DbContextOptionsBuilder<BrainFITDbContext>();
optionsBuilder.UseNpgsql(connectionString);

using var context = new BrainFITDbContext(optionsBuilder.Options);

try {
    Console.WriteLine("Checking tables...");
    var lastQuestion = await context.Questions
        .Include(q => q.Options)
        .OrderByDescending(q => q.CreatedDate)
        .FirstOrDefaultAsync();

    if (lastQuestion != null) {
        Console.WriteLine($"Last Question ID: {lastQuestion.Id}");
        Console.WriteLine($"Text: {lastQuestion.Text}");
        foreach (var opt in lastQuestion.Options) {
            Console.WriteLine($"  Option ID: {opt.Id} | Text: {opt.Text} | IsCorrect: {opt.IsCorrect}");
        }
    } else {
        Console.WriteLine("No questions found.");
    }
} catch (Exception ex) {
    Console.WriteLine($"DB Check failed: {ex.Message}");
    if (ex.InnerException != null) Console.WriteLine($"Inner: {ex.InnerException.Message}");
}

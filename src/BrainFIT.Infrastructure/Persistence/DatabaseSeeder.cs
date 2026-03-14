using BrainFIT.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace BrainFIT.Infrastructure.Persistence
{
    public static class DatabaseSeeder
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<BrainFITDbContext>();

            // Ensure database is created and migrations are applied
            await context.Database.MigrateAsync();

            var seedQuestions = new List<Question>();

            // --- MATHEMATICS ---
            seedQuestions.Add(CreateQuestion("What is the derivative of sin(x)?", "Mathematics", 2, 100, 20, new[] {
                ("cos(x)", true), ("-sin(x)", false), ("sin(x)", false), ("-cos(x)", false)
            }));
            seedQuestions.Add(CreateQuestion("If 2x + 5 = 13, what is x?", "Mathematics", 1, 50, 15, new[] {
                ("4", true), ("3", false), ("5", false), ("2", false)
            }));
            seedQuestions.Add(CreateQuestion("What is the square root of 225?", "Mathematics", 1, 50, 15, new[] {
                ("15", true), ("13", false), ("25", false), ("12", false)
            }));
            seedQuestions.Add(CreateQuestion("What is the sum of interior angles of a triangle?", "Mathematics", 1, 50, 15, new[] {
                ("180°", true), ("90°", false), ("360°", false), ("270°", false)
            }));
            seedQuestions.Add(CreateQuestion("Solve for x: x² - 9 = 0", "Mathematics", 2, 80, 20, new[] {
                ("±3", true), ("3", false), ("9", false), ("±9", false)
            }));

            // --- PHYSICS ---
            seedQuestions.Add(CreateQuestion("What is Newton's Second Law?", "Physics", 1, 50, 15, new[] {
                ("F = ma", true), ("E = mc²", false), ("V = IR", false), ("p = mv", false)
            }));
            seedQuestions.Add(CreateQuestion("What is the absolute zero temperature in Celsius?", "Physics", 2, 100, 20, new[] {
                ("-273.15°C", true), ("0°C", false), ("-100°C", false), ("100°C", false)
            }));
            seedQuestions.Add(CreateQuestion("What unit is used to measure electrical resistance?", "Physics", 1, 50, 15, new[] {
                ("Ohm", true), ("Volt", false), ("Ampere", false), ("Watt", false)
            }));
            seedQuestions.Add(CreateQuestion("What is the speed of light in a vacuum (approx)?", "Physics", 2, 80, 15, new[] {
                ("300,000 km/s", true), ("150,000 km/s", false), ("1,000,000 km/s", false), ("30,000 km/s", false)
            }));
            seedQuestions.Add(CreateQuestion("Who proposed the theory of General Relativity?", "Physics", 1, 50, 15, new[] {
                ("Albert Einstein", true), ("Isaac Newton", false), ("Nikola Tesla", false), ("Stephen Hawking", false)
            }));

            // --- CODING ---
            seedQuestions.Add(CreateQuestion("Which keyword is used to inherit a class in C#?", "Coding", 1, 50, 15, new[] {
                (":", true), ("extends", false), ("implements", false), ("using", false)
            }));
            seedQuestions.Add(CreateQuestion("Which hook is used to manage side effects in React?", "Coding", 2, 100, 20, new[] {
                ("useEffect", true), ("useState", false), ("useContext", false), ("useMemo", false)
            }));
            seedQuestions.Add(CreateQuestion("What does SQL stand for?", "Coding", 1, 50, 15, new[] {
                ("Structured Query Language", true), ("Simple Query Language", false), ("Standard Query Language", false), ("Sequential Query Language", false)
            }));
            seedQuestions.Add(CreateQuestion("What is the time complexity of a binary search?", "Coding", 3, 150, 25, new[] {
                ("O(log n)", true), ("O(n)", false), ("O(n²)", false), ("O(1)", false)
            }));
            seedQuestions.Add(CreateQuestion("In JavaScript, which operator is used for strict equality?", "Coding", 1, 50, 15, new[] {
                ("===", true), ("==", false), ("=", false), ("!==", false)
            }));
            seedQuestions.Add(CreateQuestion("What is the default port for PostgreSQL?", "Coding", 2, 80, 15, new[] {
                ("5432", true), ("3306", false), ("8080", false), ("27017", false)
            }));

            foreach (var q in seedQuestions)
            {
                if (!await context.Questions.AnyAsync(existing => existing.Text == q.Text))
                {
                    context.Questions.Add(q);
                }
            }

            // Fix any "Math" vs "Mathematics" inconsistency in existing data
            var mathQuestions = await context.Questions.Where(q => q.Category == "Math").ToListAsync();
            foreach (var mq in mathQuestions)
            {
                mq.Category = "Mathematics";
            }

            await context.SaveChangesAsync();
        }

        private static Question CreateQuestion(string text, string category, int difficulty, int points, int time, (string text, bool isCorrect)[] options)
        {
            var question = new Question
            {
                Text = text,
                Category = category,
                DifficultyLevel = difficulty,
                BasePoint = points,
                TimeLimitInSeconds = time,
                Options = options.Select(o => new Option { Text = o.text, IsCorrect = o.isCorrect }).ToList()
            };
            return question;
        }
    }
}

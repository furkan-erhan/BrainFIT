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
            var passwordHasher = scope.ServiceProvider.GetRequiredService<BrainFIT.Application.Interfaces.Security.IPasswordHasher>();

            // Ensure database is created and migrations are applied
            await context.Database.MigrateAsync();

            // 0. Seed Users
            if (!await context.Users.AnyAsync(u => u.Username == "admin"))
            {
                var admin = new User
                {
                    Id = Guid.NewGuid(),
                    Username = "admin",
                    Email = "admin@brainfit.com",
                    PasswordHash = passwordHasher.HashPassword("admin"),
                    Role = UserRole.Admin,
                    CreatedDate = DateTime.UtcNow
                };
                context.Users.Add(admin);
            }

            if (!await context.Users.AnyAsync(u => u.Username == "student"))
            {
                var student = new User
                {
                    Id = Guid.NewGuid(),
                    Username = "student",
                    Email = "student@brainfit.com",
                    PasswordHash = passwordHasher.HashPassword("student"),
                    Role = UserRole.Student,
                    CreatedDate = DateTime.UtcNow
                };
                context.Users.Add(student);
            }

            await context.SaveChangesAsync();

            // 1. Seed Questions
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

            // --- PHYSICS ---
            seedQuestions.Add(CreateQuestion("What is Newton's Second Law?", "Physics", 1, 50, 15, new[] {
                ("F = ma", true), ("E = mc²", false), ("V = IR", false), ("p = mv", false)
            }));
            seedQuestions.Add(CreateQuestion("What is the absolute zero temperature in Celsius?", "Physics", 2, 100, 20, new[] {
                ("-273.15°C", true), ("0°C", false), ("-100°C", false), ("100°C", false)
            }));

            // --- CODING ---
            seedQuestions.Add(CreateQuestion("Which keyword is used to inherit a class in C#?", "Coding", 1, 50, 15, new[] {
                (":", true), ("extends", false), ("implements", false), ("using", false)
            }));
            seedQuestions.Add(CreateQuestion("Which hook is used to manage side effects in React?", "Coding", 2, 100, 20, new[] {
                ("useEffect", true), ("useState", false), ("useContext", false), ("useMemo", false)
            }));

            foreach (var q in seedQuestions)
            {
                if (!await context.Questions.AnyAsync(existing => existing.Text == q.Text))
                {
                    context.Questions.Add(q);
                }
            }
            await context.SaveChangesAsync();

            // 2. Seed a Demo Quiz if none exists
            if (!await context.Quizzes.AnyAsync())
            {
                var allQuestions = await context.Questions.ToListAsync();
                var demoQuiz = new Quiz
                {
                    Id = Guid.NewGuid(),
                    Title = "General Knowledge Challenge",
                    Description = "A mix of Math, Physics, and Coding.",
                    CreatedDate = DateTime.UtcNow
                };

                // Link all questions to this quiz
                foreach (var q in allQuestions)
                {
                    demoQuiz.QuizQuestions.Add(new QuizQuestion { QuizId = demoQuiz.Id, QuestionId = q.Id });
                }

                context.Quizzes.Add(demoQuiz);
                await context.SaveChangesAsync();
            }

            // 3. Seed Analytics Demo Data
            if (!await context.QuizResults.AnyAsync())
            {
                try 
                {
                    await SeedAnalyticsDemoDataAsync(context);
                }
                catch (Exception ex)
                {
                    // Log error but don't crash the app if demo data fails
                    Console.WriteLine($"Warning: Failed to seed analytics demo data: {ex.Message}");
                }
            }
        }

        private static async Task SeedAnalyticsDemoDataAsync(BrainFITDbContext context)
        {
            var quizzes   = await context.Quizzes.ToListAsync();
            var questions = await context.Questions.Include(q => q.Options).ToListAsync();
            var users     = await context.Users.Select(u => u.Username).ToListAsync();

            if (!quizzes.Any() || !questions.Any()) return;
            if (!users.Any()) users.Add("student"); // Fallback

            var rand = new Random(42);
            var now  = DateTime.UtcNow;

            foreach (var userName in users)
            {
                // Check if this user already has results (to avoid double seeding if some users have data)
                if (await context.QuizResults.AnyAsync(r => r.UserName == userName)) continue;

                var sessionId = Guid.NewGuid();
                var scores    = new[] { 45.0, 60.0, 55.0, 72.0, 68.0, 80.0, 85.0, 91.0 };

                // 1. Seed Quiz Results (Score History)
                for (int i = 0; i < scores.Length; i++)
                {
                    context.QuizResults.Add(new QuizResult
                    {
                        Id = Guid.NewGuid(),
                        QuizId = quizzes[i % quizzes.Count].Id,
                        UserName = userName,
                        Score = scores[i] + rand.Next(-5, 5), // Add slight variety
                        SecondsElapsed = 120 + rand.Next(-20, 20),
                        SessionId = sessionId,
                        CreatedDate = now.AddDays(-(scores.Length - i) * 2)
                    });
                }

                // 2. Seed User Answers (Subject Mastery)
                foreach (var question in questions)
                {
                    bool isCorrect = rand.NextDouble() > 0.35;
                    var selectedOption = isCorrect 
                        ? question.Options.FirstOrDefault(o => o.IsCorrect)
                        : question.Options.FirstOrDefault(o => !o.IsCorrect);
                    
                    if (selectedOption == null) continue;

                    context.UserAnswers.Add(new UserAnswer
                    {
                        Id = Guid.NewGuid(),
                        QuizId = quizzes.First().Id,
                        QuestionId = question.Id,
                        SelectedOptionId = selectedOption.Id,
                        UserName = userName,
                        IsCorrect = isCorrect,
                        Score = isCorrect ? question.BasePoint : 0,
                        SecondsElapsed = rand.Next(5, 15),
                        SessionId = sessionId,
                        CreatedDate = now.AddDays(-rand.Next(1, 14))
                    });
                }
            }

            await context.SaveChangesAsync();
        }

        private static Question CreateQuestion(string text, string category, int difficulty, int points, int time, (string text, bool isCorrect)[] options)
        {
            return new Question
            {
                Text = text,
                Category = category,
                DifficultyLevel = difficulty,
                BasePoint = points,
                TimeLimitInSeconds = time,
                Options = options.Select(o => new Option { Text = o.text, IsCorrect = o.isCorrect }).ToList()
            };
        }
    }
}

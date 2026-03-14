using BrainFIT.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BrainFIT.Infrastructure.Persistence
{
    public class BrainFITDbContext : DbContext
    {
        public BrainFITDbContext(DbContextOptions<BrainFITDbContext> options) : base(options)
        {
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
            // Suppress the pending model changes warning to allow MigrateAsync to run
            optionsBuilder.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
        }

        public DbSet<Quiz> Quizzes => Set<Quiz>();
        public DbSet<Question> Questions => Set<Question>();
        public DbSet<QuizQuestion> QuizQuestions => Set<QuizQuestion>();
        public DbSet<Option> Options => Set<Option>();
        public DbSet<QuizResult> QuizResults => Set<QuizResult>();
        public DbSet<User> Users => Set<User>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Configure Many-to-Many
            modelBuilder.Entity<QuizQuestion>()
                .HasKey(qq => new { qq.QuizId, qq.QuestionId });

            modelBuilder.Entity<QuizQuestion>()
                .HasOne(qq => qq.Quiz)
                .WithMany(q => q.QuizQuestions)
                .HasForeignKey(qq => qq.QuizId);

            modelBuilder.Entity<QuizQuestion>()
                .HasOne(qq => qq.Question)
                .WithMany(q => q.QuizQuestions)
                .HasForeignKey(qq => qq.QuestionId);

            modelBuilder.Entity<QuizResult>()
                .HasOne(qr => qr.Quiz)
                .WithMany()
                .HasForeignKey(qr => qr.QuizId);

            modelBuilder.Entity<QuizResult>()
                .HasIndex(qr => qr.QuizId);

            modelBuilder.Entity<QuizResult>()
                .HasIndex(qr => qr.UserName);
        }
    }
}

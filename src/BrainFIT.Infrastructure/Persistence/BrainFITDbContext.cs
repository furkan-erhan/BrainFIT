using BrainFIT.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BrainFIT.Infrastructure.Persistence
{
    public class BrainFITDbContext : DbContext
    {
        public BrainFITDbContext(DbContextOptions<BrainFITDbContext> options) : base(options)
        {
        }

        public DbSet<Quiz> Quizzes => Set<Quiz>();
        public DbSet<Question> Questions => Set<Question>();
        public DbSet<Option> Options => Set<Option>();
        public DbSet<QuizResult> QuizResults => Set<QuizResult>();
        public DbSet<User> Users => Set<User>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            modelBuilder.Entity<Quiz>()
                .HasMany(q => q.Questions)
                .WithOne(q => q.Quiz)
                .HasForeignKey(q => q.QuizId);

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

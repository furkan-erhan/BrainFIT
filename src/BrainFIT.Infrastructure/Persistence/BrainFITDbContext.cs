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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Additional configuration can be added here if needed
            modelBuilder.Entity<Quiz>()
                .HasMany(q => q.Questions)
                .WithOne()
                .HasForeignKey(q => q.Id); // Assuming some default mapping for now or BaseEntity properties
        }
    }
}

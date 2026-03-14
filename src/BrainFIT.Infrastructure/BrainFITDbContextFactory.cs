using BrainFIT.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace BrainFIT.Infrastructure
{
    /// <summary>
    /// Provides a design-time factory for BrainFITDbContext.
    /// Required for `dotnet ef` commands that run outside of the API startup.
    /// </summary>
    public sealed class BrainFITDbContextFactory : IDesignTimeDbContextFactory<BrainFITDbContext>
    {
        public BrainFITDbContext CreateDbContext(string[] args)
        {
            // Read connection string from environment variable or use the dev appsettings fallback.
            var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
                ?? "Host=localhost;Port=5432;Database=BrainFITDb;Username=postgres;Password=admin";

            var options = new DbContextOptionsBuilder<BrainFITDbContext>()
                .UseNpgsql(connectionString)
                .Options;

            return new BrainFITDbContext(options);
        }
    }
}

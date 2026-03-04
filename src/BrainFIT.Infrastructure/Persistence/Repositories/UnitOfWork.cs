using System.Threading;
using System.Threading.Tasks;
using BrainFIT.Application.Interfaces.Repositories;

namespace BrainFIT.Infrastructure.Persistence.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly BrainFITDbContext _context;

        public UnitOfWork(BrainFITDbContext context)
        {
            _context = context;
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }
    }
}

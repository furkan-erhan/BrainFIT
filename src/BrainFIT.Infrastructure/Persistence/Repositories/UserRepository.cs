using BrainFIT.Application.Interfaces.Repositories;
using BrainFIT.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BrainFIT.Infrastructure.Persistence.Repositories
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        private readonly BrainFITDbContext _context;

        public UserRepository(BrainFITDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> GetByEmailOrUsernameAsync(string identifier)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == identifier || u.Username == identifier);
        }
    }
}

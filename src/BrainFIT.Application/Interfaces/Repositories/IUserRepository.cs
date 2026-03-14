using BrainFIT.Domain.Entities;

namespace BrainFIT.Application.Interfaces.Repositories
{
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByEmailOrUsernameAsync(string identifier);
    }
}

using BrainFIT.Domain.Entities;

namespace BrainFIT.Application.Interfaces.Security
{
    public interface IPasswordHasher
    {
        string HashPassword(string password);
        bool VerifyPassword(string password, string hashedPassword);
    }

    public interface IJwtService
    {
        string GenerateToken(User user);
    }
}

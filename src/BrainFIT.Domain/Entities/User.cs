using BrainFIT.Domain.Common;

namespace BrainFIT.Domain.Entities
{
    public enum UserRole
    {
        Student,
        Admin
    }

    public class User : BaseEntity
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.Student;
    }
}

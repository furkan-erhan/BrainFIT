using BrainFIT.Application.DTOs.Auth;
using BrainFIT.Application.Interfaces.Repositories;
using BrainFIT.Application.Interfaces.Security;
using BrainFIT.Application.Interfaces.Services;
using BrainFIT.Domain.Entities;

namespace BrainFIT.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _uow;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtService _jwtService;

        public AuthService(
            IUserRepository userRepository, 
            IUnitOfWork uow, 
            IPasswordHasher passwordHasher, 
            IJwtService jwtService)
        {
            _userRepository = userRepository;
            _uow = uow;
            _passwordHasher = passwordHasher;
            _jwtService = jwtService;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            var existingUser = await _userRepository.GetByEmailAsync(request.Email);
            if (existingUser != null)
            {
                throw new Exception("User with this email already exists.");
            }

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = _passwordHasher.HashPassword(request.Password),
                Role = UserRole.Student // Default role
            };

            await _userRepository.AddAsync(user);
            await _uow.SaveChangesAsync();

            var token = _jwtService.GenerateToken(user);

            return new AuthResponse(token, user.Username, user.Email, user.Role.ToString());
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _userRepository.GetByEmailOrUsernameAsync(request.Email);

            if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
            {
                throw new Exception("Invalid email/username or password.");
            }


            var token = _jwtService.GenerateToken(user);

            return new AuthResponse(token, user.Username, user.Email, user.Role.ToString());
        }
    }
}

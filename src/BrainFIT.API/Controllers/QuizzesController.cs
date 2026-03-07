using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using BrainFIT.Application.Contracts.Quizzes;
using BrainFIT.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace BrainFIT.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public sealed class QuizzesController : ControllerBase
    {
        private readonly IQuizService _quizService;

        public QuizzesController(IQuizService quizService)
        {
            _quizService = quizService;
        }

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<QuizResponse>>> GetAll(CancellationToken ct)
        {
            var results = await _quizService.GetAllAsync(ct);
            return Ok(results);
        }

        [HttpPost]
        public async Task<ActionResult<Guid>> Create([FromBody] CreateQuizRequest request, CancellationToken ct)
        {
            var id = await _quizService.CreateAsync(request, ct);
            return Ok(id);
        }

        [HttpDelete("{id:guid}")]
        public async Task<ActionResult> Delete(Guid id, CancellationToken ct)
        {
            var success = await _quizService.DeleteAsync(id, ct);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}

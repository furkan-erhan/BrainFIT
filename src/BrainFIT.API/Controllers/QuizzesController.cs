using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using BrainFIT.Application.Common;
using BrainFIT.Application.Contracts.Quizzes;
using BrainFIT.Application.Interfaces.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

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
        public async Task<ActionResult<Result<IReadOnlyList<QuizResponse>>>> GetAll(CancellationToken ct)
        {
            var result = await _quizService.GetAllAsync(ct);
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<Result<QuizGetByIdResponse>>> GetById(Guid id, CancellationToken ct)
        {
            var result = await _quizService.GetByIdAsync(id, ct);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Result<Guid>>> Create([FromBody] CreateQuizRequest request, CancellationToken ct)
        {
            var result = await _quizService.CreateAsync(request, ct);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Result>> Delete(Guid id, CancellationToken ct)
        {
            var result = await _quizService.DeleteAsync(id, ct);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }

        [HttpPost("{id:guid}/questions/{questionId:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Result>> AddQuestion(Guid id, Guid questionId, CancellationToken ct)
        {
            var result = await _quizService.AddQuestionToQuizAsync(id, questionId, ct);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpDelete("{id:guid}/questions/{questionId:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Result>> RemoveQuestion(Guid id, Guid questionId, CancellationToken ct)
        {
            var result = await _quizService.RemoveQuestionFromQuizAsync(id, questionId, ct);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }
    }
}

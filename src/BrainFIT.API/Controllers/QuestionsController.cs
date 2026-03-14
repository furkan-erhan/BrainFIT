using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BrainFIT.Application.Common;
using BrainFIT.Application.Contracts.Answers;
using BrainFIT.Application.Contracts.Questions;
using BrainFIT.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace BrainFIT.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public sealed class QuestionsController : ControllerBase
    {
        private readonly IAnswerService _answerService;
        private readonly IQuestionService _questionService;

        public QuestionsController(IAnswerService answerService, IQuestionService questionService)
        {
            _answerService = answerService;
            _questionService = questionService;
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<Result<object>>> GetQuestion(Guid id, CancellationToken ct)
        {
            var result = await _questionService.GetByIdAsync(id, ct);
            if (!result.Success || result.Data is null)
                return NotFound(result);

            var q = result.Data;
            var response = new
            {
                id = q.Id,
                text = q.Text,
                options = q.Options.Select(o => new { id = o.Id, text = o.Text, isCorrect = o.IsCorrect })
            };

            return Ok(Result<object>.Ok(response));
        }

        [HttpPost]
        public async Task<ActionResult<Result<SubmitAnswerResponse>>> SubmitAnswer([FromBody] SubmitAnswerRequest request, CancellationToken ct)
        {
            var result = await _answerService.SubmitAsync(request, ct);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpPost("create")]
        public async Task<ActionResult<Result<Guid>>> CreateQuestion([FromBody] CreateQuestionRequest request, CancellationToken ct)
        {
            var result = await _questionService.AddQuestionAsync(request, ct);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpGet("pool")]
        public async Task<ActionResult<Result<object>>> GetQuestions([FromQuery] string? categoryId, CancellationToken ct)
        {
            var result = string.IsNullOrEmpty(categoryId)
                ? await _questionService.GetAllAsync(ct)
                : await _questionService.GetByCategoryAsync(categoryId, ct);

            if (!result.Success || result.Data is null)
                return NotFound(result);

            var response = result.Data.Select(q => new
            {
                id = q.Id,
                text = q.Text,
                categoryId = q.Category,
                difficultyLevel = q.DifficultyLevel,
                options = q.Options.Select(o => new { id = o.Id, text = o.Text, isCorrect = o.IsCorrect })
            });

            return Ok(Result<object>.Ok(response));
        }
    }
}

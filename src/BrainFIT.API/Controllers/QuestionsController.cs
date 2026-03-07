using System;
using System.Threading;
using System.Threading.Tasks;
using BrainFIT.Application.Contracts.Answers;
using BrainFIT.Application.Contracts.Questions;
using BrainFIT.Application.Interfaces.Services;
using BrainFIT.Domain.Entities;
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
        public async Task<ActionResult<object>> GetQuestion(Guid id, CancellationToken ct)
        {
            var q = await _questionService.GetByIdAsync(id, ct);
            if (q is null) return NotFound();
            return Ok(new
            {
                id = q.Id,
                text = q.Text,
                options = q.Options.Select(o => new { id = o.Id, text = o.Text, isCorrect = o.IsCorrect })
            });
        }

        // Issue'nin istediği: Answer submit
        [HttpPost]
        public async Task<ActionResult<SubmitAnswerResponse>> SubmitAnswer([FromBody] SubmitAnswerRequest request, CancellationToken ct)
        {
            try
            {
                var result = await _answerService.SubmitAsync(request, ct);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // Task'ı tamamlamak için: Quiz'e question ekleme endpoint'i (opsiyonel ama pratik)
        [HttpPost("create")]
        public async Task<ActionResult<Guid>> CreateQuestion([FromBody] CreateQuestionRequest request, CancellationToken ct)
        {
            try
            {
                var id = await _questionService.AddQuestionAsync(request, ct);
                return Ok(id);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}

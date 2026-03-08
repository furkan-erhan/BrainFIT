using System;

namespace BrainFIT.Application.Common
{
    public class Result
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;

        public static Result Ok(string message = "") => new() { Success = true, Message = message };
        public static Result Failure(string message) => new() { Success = false, Message = message };
    }

    public class Result<T> : Result
    {
        public T? Data { get; set; }

        public static Result<T> Ok(T data, string message = "") => new() { Success = true, Data = data, Message = message };
        public static new Result<T> Failure(string message) => new() { Success = false, Message = message };
    }
}

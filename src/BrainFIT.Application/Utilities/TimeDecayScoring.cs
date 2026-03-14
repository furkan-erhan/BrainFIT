using System;

namespace BrainFIT.Application.Utilities
{
    public static class TimeDecayScoring
    {
        // Formula: MaxPoints - (SecondsElapsed / 2)
        // Here MaxPoints = Question.BasePoint
        // Edge cases:
        // - score cannot be negative
        // - seconds cannot be negative
        public static int Calculate(int maxPoints, int secondsElapsed)
        {
            if (maxPoints < 0)
                throw new ArgumentOutOfRangeException(nameof(maxPoints), "MaxPoints cannot be negative.");

            if (secondsElapsed < 0)
                secondsElapsed = 0;

            // Much faster decay: Subtract 5 points per second
            var score = maxPoints - (secondsElapsed * 5); 
            return score < 0 ? 0 : score;
        }
    }
}

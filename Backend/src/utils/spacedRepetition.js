/**
 * SuperMemo-2 (SM-2) Spaced Repetition Algorithm
 * 
 * @param {number} quality - User's grade on the review (0-5)
 *     0: Complete blackout
 *     1: Incorrect, but remembered the correct answer once revealed
 *     2: Incorrect, but it seemed familiar
 *     3: Correct, but required significant difficulty/effort
 *     4: Correct after hesitation
 *     5: Perfect response
 * @param {number} interval - Previous interval in days
 * @param {number} repetitions - Previous number of consecutive successful recalls
 * @param {number} easeFactor - Previous ease factor
 * 
 * @returns {Object} { interval, repetitions, easeFactor }
 */
export const calculateNextReview = (quality, interval, repetitions, easeFactor) => {
  let newInterval;
  let newRepetitions;
  let newEaseFactor;

  // If the user's score is < 3, it's considered a failed recall
  if (quality >= 3) {
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
    newRepetitions = repetitions + 1;
  } else {
    // Reset streak on failure
    newRepetitions = 0;
    newInterval = 1;
  }

  // Calculate new Ease Factor
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  // EF should never drop below 1.3
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  return {
    interval: newInterval,
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
  };
};

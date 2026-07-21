/**
 * Indian (Vedic) numerology helpers.
 *
 * Mulank (Moolank / "root number"): derived only from the DAY of birth,
 * reduced by repeated digit-sum to a single digit 1-9.
 *   e.g. born on the 27th -> 2 + 7 = 9 -> Mulank 9
 *
 * Bhagyank (Bhagyank / "destiny number"): derived from the FULL date of
 * birth (day + month + year), reduced by repeated digit-sum to a single
 * digit 1-9.
 *   e.g. 27-11-1994 -> 2+7+1+1+1+9+9+4 = 34 -> 3+4 = 7 -> Bhagyank 7
 *
 * Note: unlike Western/Pythagorean numerology, mainstream Indian numerology
 * does not stop the reduction early for "master numbers" (11, 22) -- it
 * reduces all the way to a single digit 1-9. We follow that convention here.
 */

function reduceToSingleDigit(n) {
  let num = Math.abs(n);
  while (num > 9) {
    num = String(num)
      .split('')
      .reduce((sum, digit) => sum + Number(digit), 0);
  }
  return num;
}

function digitSum(str) {
  return str
    .split('')
    .filter((c) => /[0-9]/.test(c))
    .reduce((sum, digit) => sum + Number(digit), 0);
}

/**
 * @param {string} dob - date of birth in "YYYY-MM-DD" format
 */
export function computeMulank(dob) {
  const day = Number(dob.split('-')[2]);
  return reduceToSingleDigit(day);
}

/**
 * @param {string} dob - date of birth in "YYYY-MM-DD" format
 */
export function computeBhagyank(dob) {
  const [year, month, day] = dob.split('-');
  const total = digitSum(day) + digitSum(month) + digitSum(year);
  return reduceToSingleDigit(total);
}

const MULANK_TRAITS = {
  1: 'Leadership, independence, drive, and originality. Ruled by the Sun.',
  2: 'Sensitivity, diplomacy, partnership, and intuition. Ruled by the Moon.',
  3: 'Creativity, expression, optimism, and communication. Ruled by Jupiter.',
  4: 'Discipline, stability, hard work, and practicality. Ruled by Rahu (in some systems, Uranus).',
  5: 'Adaptability, freedom, curiosity, and change. Ruled by Mercury.',
  6: 'Harmony, responsibility, beauty, and nurturing. Ruled by Venus.',
  7: 'Introspection, spirituality, analysis, and wisdom. Ruled by Ketu.',
  8: 'Ambition, resilience, justice, and material mastery. Ruled by Saturn.',
  9: 'Compassion, idealism, courage, and completion. Ruled by Mars.',
};

const BHAGYANK_TRAITS = {
  1: 'A destiny of leadership and pioneering new paths.',
  2: 'A destiny shaped by partnerships, cooperation, and emotional depth.',
  3: 'A destiny of creative expression and inspiring others.',
  4: 'A destiny built through steady effort and structure.',
  5: 'A destiny of movement, versatility, and reinvention.',
  6: 'A destiny centered on love, family, and responsibility.',
  7: 'A destiny of introspection, learning, and inner transformation.',
  8: 'A destiny tied to power, achievement, and karmic lessons.',
  9: 'A destiny of service, humanitarianism, and letting go.',
};

export function getMulankTrait(mulank) {
  return MULANK_TRAITS[mulank] || '';
}

export function getBhagyankTrait(bhagyank) {
  return BHAGYANK_TRAITS[bhagyank] || '';
}

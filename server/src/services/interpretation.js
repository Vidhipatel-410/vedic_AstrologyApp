import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';

function buildPrompt({ name, dob, mulank, bhagyank, chart }) {
  const planetLines = chart.planets
    .map(
      (p) =>
        `- ${p.name}: ${p.sign} (House ${p.house}), ${p.degreeInSign}°, Nakshatra ${p.nakshatra} Pada ${p.pada}${p.retrograde ? ', Retrograde' : ''}`
    )
    .join('\n');

  return `You are an experienced Vedic (Jyotish) astrologer and numerologist writing a warm, insightful, personalized reading. Base your reading strictly on the placements given below -- do not invent additional planetary positions.

Person: ${name}
Date of birth: ${dob}

Numerology:
- Mulank (root number): ${mulank}
- Bhagyank (destiny number): ${bhagyank}

Ascendant (Lagna): ${chart.ascendant.sign}, Nakshatra ${chart.ascendant.nakshatra}

Planetary placements (sidereal / Lahiri ayanamsa, whole-sign houses):
${planetLines}

Write a reading with the following sections, using the exact markdown headers shown:

## Personality & Core Nature
## Love & Relationships
## Career & Success
## Health & Wellbeing
## Key Strengths
## Challenges to Watch
## Overall Life Theme

Guidelines:
- Ground every claim in the specific placements above (mention the relevant planet, sign, or house naturally in the prose).
- Be encouraging and constructive, not fatalistic. Frame challenges as growth areas.
- Avoid generic horoscope-column filler; be specific to this chart.
- Do not give medical, legal, or financial advice -- keep health/career comments general and empowering.
- Around 500-700 words total.`;
}

/**
 * @returns {Promise<string>} markdown-formatted reading
 */
export async function generateReading({ name, dob, mulank, bhagyank, chart }) {
  const prompt = buildPrompt({ name, dob, mulank, bhagyank, chart });

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n');

  return text;
}

import { Router } from 'express';
import { computeMulank, computeBhagyank, getMulankTrait, getBhagyankTrait } from '../services/numerology.js';
import { geocodePlace } from '../services/geocode.js';
import { computeVedicChart } from '../services/astrology.js';
import { generateReading } from '../services/interpretation.js';

const router = Router();

router.post('/analyze', async (req, res) => {
  try {
    const { name, dob, tob, placeOfBirth } = req.body;

    if (!name || !dob || !tob || !placeOfBirth) {
      return res.status(400).json({
        error: 'name, dob (YYYY-MM-DD), tob (HH:mm), and placeOfBirth are all required.',
      });
    }

    // 1. Numerology (pure math, instant, no external calls)
    const mulank = computeMulank(dob);
    const bhagyank = computeBhagyank(dob);

    // 2. Resolve place of birth -> coordinates + timezone
    const location = await geocodePlace(placeOfBirth);

    // 3. Real sidereal (Vedic) chart via Swiss Ephemeris
    const chart = await computeVedicChart({
      dob,
      tob,
      timezone: location.timezone,
      lat: location.lat,
      lon: location.lon,
    });

    // 4. Personalized reading via Claude
    const reading = await generateReading({
      name,
      dob,
      mulank,
      bhagyank,
      chart,
    });

    res.json({
      name,
      dob,
      tob,
      location,
      numerology: {
        mulank,
        mulankTrait: getMulankTrait(mulank),
        bhagyank,
        bhagyankTrait: getBhagyankTrait(bhagyank),
      },
      chart,
      reading,
    });
  } catch (err) {
    console.error('Error in /api/analyze:', err);
    res.status(500).json({ error: err.message || 'Something went wrong computing the chart.' });
  }
});

export default router;

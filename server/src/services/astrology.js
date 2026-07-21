import {
  julianDay,
  calculatePosition,
  calculateHouses,
  setSiderealMode,
  getAyanamsa,
  Planet,
  LunarPoint,
  HouseSystem,
  CalculationFlag,
  SiderealMode,
  CalendarType,
} from '@swisseph/node';
import moment from 'moment-timezone';

/**
 * Real sidereal (Vedic / Jyotish) chart calculation using the Swiss Ephemeris.
 *
 * Uses @swisseph/node (prebuilt binaries, no C++ build tools required on Windows).
 */

const PLANETS = [
  { name: 'Sun', id: Planet.Sun },
  { name: 'Moon', id: Planet.Moon },
  { name: 'Mercury', id: Planet.Mercury },
  { name: 'Venus', id: Planet.Venus },
  { name: 'Mars', id: Planet.Mars },
  { name: 'Jupiter', id: Planet.Jupiter },
  { name: 'Saturn', id: Planet.Saturn },
  { name: 'Rahu', id: LunarPoint.MeanNode },
];

const RASHIS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta',
  'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

const CALC_FLAGS =
  CalculationFlag.MoshierEphemeris |
  CalculationFlag.Speed |
  CalculationFlag.Sidereal;

function toSiderealLongitude(tropicalLongitude, ayanamsa) {
  return ((tropicalLongitude - ayanamsa) % 360 + 360) % 360;
}

function signAndDegree(longitude) {
  const norm = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(norm / 30);
  const degreeInSign = norm - signIndex * 30;
  return { signIndex, sign: RASHIS[signIndex], degreeInSign };
}

function nakshatraFor(longitude) {
  const norm = ((longitude % 360) + 360) % 360;
  const span = 360 / 27;
  const index = Math.floor(norm / span);
  const posInNakshatra = norm - index * span;
  const pada = Math.floor(posInNakshatra / (span / 4)) + 1;
  return { name: NAKSHATRAS[index], pada };
}

function houseFromSign(planetSignIndex, ascendantSignIndex) {
  return ((planetSignIndex - ascendantSignIndex + 12) % 12) + 1;
}

/**
 * @param {object} params
 * @param {string} params.dob - "YYYY-MM-DD"
 * @param {string} params.tob - "HH:mm" (24-hour, local time at birthplace)
 * @param {string} params.timezone - IANA timezone name, e.g. "Asia/Kolkata"
 * @param {number} params.lat
 * @param {number} params.lon
 */
export async function computeVedicChart({ dob, tob, timezone, lat, lon }) {
  setSiderealMode(SiderealMode.Lahiri);

  const localMoment = moment.tz(`${dob} ${tob}`, 'YYYY-MM-DD HH:mm', timezone);
  if (!localMoment.isValid()) {
    throw new Error('Invalid date/time/timezone combination.');
  }
  const utcMoment = localMoment.clone().utc();

  const decimalHourUT =
    utcMoment.hour() + utcMoment.minute() / 60 + utcMoment.second() / 3600;

  const julianDayUT = julianDay(
    utcMoment.year(),
    utcMoment.month() + 1,
    utcMoment.date(),
    decimalHourUT,
    CalendarType.Gregorian
  );

  const ayanamsa = getAyanamsa(julianDayUT);
  const houses = calculateHouses(julianDayUT, lat, lon, HouseSystem.WholeSign);
  const ascendantLongitude = toSiderealLongitude(houses.ascendant, ayanamsa);
  const ascendant = signAndDegree(ascendantLongitude);
  const ascendantNakshatra = nakshatraFor(ascendantLongitude);

  const planetResults = PLANETS.map((p) => {
    const calc = calculatePosition(julianDayUT, p.id, CALC_FLAGS);
    const { sign, signIndex, degreeInSign } = signAndDegree(calc.longitude);
    const nak = nakshatraFor(calc.longitude);
    return {
      name: p.name,
      sign,
      degreeInSign: Number(degreeInSign.toFixed(2)),
      house: houseFromSign(signIndex, ascendant.signIndex),
      retrograde: calc.longitudeSpeed < 0,
      nakshatra: nak.name,
      pada: nak.pada,
    };
  });

  const rahu = planetResults.find((p) => p.name === 'Rahu');
  const rahuLongitude = RASHIS.indexOf(rahu.sign) * 30 + rahu.degreeInSign;
  const ketuLongitude = (rahuLongitude + 180) % 360;
  const ketuSign = signAndDegree(ketuLongitude);
  const ketuNak = nakshatraFor(ketuLongitude);
  planetResults.push({
    name: 'Ketu',
    sign: ketuSign.sign,
    degreeInSign: Number(ketuSign.degreeInSign.toFixed(2)),
    house: houseFromSign(ketuSign.signIndex, ascendant.signIndex),
    retrograde: true,
    nakshatra: ketuNak.name,
    pada: ketuNak.pada,
  });

  return {
    julianDayUT,
    utcDateTime: utcMoment.format(),
    ascendant: {
      sign: ascendant.sign,
      degreeInSign: Number(ascendant.degreeInSign.toFixed(2)),
      nakshatra: ascendantNakshatra.name,
    },
    planets: planetResults,
  };
}

import fetch from 'node-fetch';
import tzLookup from 'tz-lookup';

const DEFAULT_USER_AGENT = 'VedicAstrologyApp/1.0 (local-development)';

/**
 * Nominatim blocks generic or fake contact info (e.g. example.com emails).
 * See https://operations.osmfoundation.org/policies/nominatim/
 */
function getUserAgent() {
  const configured = process.env.NOMINATIM_USER_AGENT?.trim();
  if (!configured) return DEFAULT_USER_AGENT;

  const looksFake =
    /example\.(com|org|net)/i.test(configured) ||
    configured.includes('set NOMINATIM_USER_AGENT');

  if (looksFake) {
    console.warn(
      'NOMINATIM_USER_AGENT looks like a placeholder; using default. ' +
        'Set a real app name and contact email/URL in server/.env.'
    );
    return DEFAULT_USER_AGENT;
  }

  return configured;
}

function parseCoordinates(lat, lon) {
  const parsedLat = parseFloat(lat);
  const parsedLon = parseFloat(lon);
  if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLon)) {
    throw new Error('Geocoder returned invalid coordinates.');
  }
  return { lat: parsedLat, lon: parsedLon };
}

async function geocodeWithNominatim(placeName, userAgent) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
    placeName
  )}`;

  const res = await fetch(url, {
    headers: { 'User-Agent': userAgent, Accept: 'application/json' },
  });

  if (!res.ok) {
    const err = new Error(`Nominatim geocoding failed with status ${res.status}`);
    err.status = res.status;
    throw err;
  }

  const results = await res.json();
  if (!results?.length) return null;

  const best = results[0];
  const { lat, lon } = parseCoordinates(best.lat, best.lon);
  return {
    lat,
    lon,
    displayName: best.display_name,
  };
}

async function geocodeWithPhoton(placeName, userAgent) {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(placeName)}&limit=1`;

  const res = await fetch(url, {
    headers: { 'User-Agent': userAgent, Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Photon geocoding failed with status ${res.status}`);
  }

  const data = await res.json();
  const feature = data?.features?.[0];
  if (!feature) return null;

  const [lon, lat] = feature.geometry.coordinates;
  const props = feature.properties ?? {};
  const displayName =
    props.name && props.country
      ? [props.name, props.state, props.country].filter(Boolean).join(', ')
      : props.name || placeName;

  const coords = parseCoordinates(lat, lon);
  return {
    lat: coords.lat,
    lon: coords.lon,
    displayName,
  };
}

/**
 * Resolve a free-text place of birth ("Navsari, Gujarat, India") into
 * coordinates + an IANA timezone name.
 */
export async function geocodePlace(placeName) {
  const userAgent = getUserAgent();
  let location = null;

  try {
    location = await geocodeWithNominatim(placeName, userAgent);
  } catch (err) {
    if (err.status === 403) {
      console.warn('Nominatim blocked the request; falling back to Photon geocoder.');
    } else {
      throw new Error(`Geocoding request failed with status ${err.status || 'unknown'}`);
    }
  }

  if (!location) {
    location = await geocodeWithPhoton(placeName, userAgent);
  }

  if (!location) {
    throw new Error(
      `Could not find "${placeName}". Try adding more detail, e.g. "City, State, Country".`
    );
  }

  const timezone = tzLookup(location.lat, location.lon);

  return {
    lat: location.lat,
    lon: location.lon,
    displayName: location.displayName,
    timezone,
  };
}

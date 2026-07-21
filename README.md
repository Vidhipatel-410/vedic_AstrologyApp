# Vedic Astrology & Numerology App

A full-stack app that takes a person's **full name, date of birth, time of birth, and place of
birth**, then shows:

- **Mulank** (numerology root number) and **Bhagyank** (destiny number)
- A real **sidereal (Vedic) birth chart** — every planet's sign, house, degree, and nakshatra,
  computed with the **Swiss Ephemeris** (the same astronomical engine used by professional
  astrology software), using the **Lahiri ayanamsa** and **Whole-Sign houses**
- A personalized **AI-generated reading** (personality, love, career, health, strengths,
  challenges) written live by the **Claude API**, grounded in the actual computed chart

## Why this architecture

Accurate planetary positions require real astronomical calculation (an "ephemeris"), not
something an AI model can reliably compute on its own — models are not accurate calculators for
orbital mechanics. So the split is:

| Layer | Does | Technology |
|---|---|---|
| Numerology | Pure math on the date | JavaScript |
| Birth chart | Real astronomy | Swiss Ephemeris (`swisseph` npm package) |
| Geocoding | Place name → lat/lon → timezone | OpenStreetMap Nominatim + `tz-lookup` |
| Reading | Turns chart data into prose | Claude API (`@anthropic-ai/sdk`) |

The backend computes the chart first, then hands Claude the *already-computed* placements and
asks it to write the interpretation — Claude never invents the astronomy, only the narrative.

## Project structure

```
vedic-astrology-app/
├── server/          Express API (numerology + astrology + Claude calls)
│   ├── src/
│   │   ├── index.js
│   │   ├── routes/analyze.js
│   │   └── services/
│   │       ├── numerology.js
│   │       ├── geocode.js
│   │       ├── astrology.js
│   │       └── interpretation.js
│   ├── package.json
│   └── .env.example
└── client/           React (Vite) frontend
    ├── src/
    │   ├── App.jsx
    │   ├── components/
    │   └── api.js
    └── package.json
```

## Setup

### 1. Prerequisites

- Node.js 18+
- A C/C++ build toolchain (needed to compile the `swisseph` native addon):
  - **macOS**: `xcode-select --install`
  - **Ubuntu/Debian**: `sudo apt install build-essential python3`
  - **Windows**: install "Desktop development with C++" via Visual Studio Build Tools, or use WSL
- An Anthropic API key from https://console.anthropic.com/

### 2. Backend

```bash
cd server
npm install
cp .env.example .env
# edit .env and paste in your ANTHROPIC_API_KEY
npm run dev
```

The server starts on `http://localhost:4000`.

### 3. Frontend

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api` calls to the backend
automatically (see `vite.config.js`).

### 4. Try it

Fill in a name, date of birth, time of birth, and place of birth (be specific — "Navsari,
Gujarat, India" works better than just "Navsari"), then submit. You'll see the numerology
numbers, the full planetary table, and a generated reading below it.

## Accuracy notes (please read)

- **Ephemeris precision**: by default the app uses `SEFLG_MOSEPH` (Moshier's semi-analytic
  ephemeris), which ships inside the `swisseph` package with **no extra file downloads** and is
  accurate to a few arc-seconds for any date in recorded history — enough for astrology. For
  maximum precision (sub-arcsecond, useful for extreme historical dates), download the official
  Swiss Ephemeris data files from https://www.astro.com/ftp/swisseph/ephe/, point
  `swisseph.swe_set_ephe_path()` at that folder in `astrology.js`, and swap the flag constant
  from `SEFLG_MOSEPH` to `SEFLG_SWIEPH`.
- **House system**: Whole-Sign houses (`'W'`) are used, which is the traditional system in Vedic
  astrology. If you want Placidus or another Western house system, change the `hsys` character
  passed to `swe_houses_ex` in `astrology.js`.
- **Ayanamsa**: Lahiri, the most widely used ayanamsa in Indian astrology. Other options
  (Raman, KP, etc.) are available via `swisseph.SE_SIDM_*` constants.
- **Timezone accuracy**: birth time is converted to UTC using `moment-timezone`, which has
  historical DST/offset data — important for older birth dates where a country's offset rules
  may have changed since.
- **Geocoding**: uses the free OpenStreetMap Nominatim API, which has a usage policy (no heavy
  automated traffic, must set a descriptive `User-Agent` — already wired up via
  `NOMINATIM_USER_AGENT` in `.env`). For production traffic at scale, consider a paid geocoding
  provider instead.
- **Numerology convention**: this uses the standard Indian numerology reduction (digit-sum down
  to 1–9, no "master numbers" retained), which is the convention implied by the terms "Mulank"
  and "Bhagyank."
- **Rahu/Ketu**: computed as the Mean Lunar Node (and its exact opposite point for Ketu), which
  is the most common convention; the code can be switched to the True Node via
  `swisseph.SE_TRUE_NODE` if you prefer that convention.

## Extending it

- Add divisional charts (Navamsa/D9, etc.) — same Swiss Ephemeris data, different math on the
  longitude.
- Add dasha (planetary period) calculations for timing-based predictions.
- Cache geocoding results and chart calculations per (dob, tob, place) so repeat visitors don't
  re-hit Nominatim or Claude.
- Add authentication + a database if you want to save charts for returning users.
- Swap `react-markdown` rendering for a nicer typeset reading view, or add a PDF export.

## Disclaimer

This app is for entertainment, reflection, and cultural/spiritual interest. It does not provide
medical, legal, or financial advice, and the generated readings should not be treated as
deterministic predictions.


# Smart Weather Dashboard — Phase 7

Live current weather and air quality using Node.js, Express, and OpenWeather.
Developed by Team Tech Trojans.

## Run locally

1. Install Node.js 22 or newer.
2. Extract this package. Keep `public` and `test` as folders.
3. Put your existing `.env` beside `server.js`, or copy `.env.example` to `.env`
   and set `OPENWEATHER_API_KEY` to your own key. The older `API_KEY` name is also supported.
4. Run `npm ci`, then `npm start` in the project folder.
5. Open http://localhost:3000 and search for a city, for example `Villupuram`.

Do not open `index.html` directly. Express serves both the page and the API.
Set `PORT` in `.env` if you need a different port.

## Phase 7 additions

- City and country code, temperature and feels-like temperature in °C.
- Weather description and official OpenWeather icon, including day/night variants.
- Humidity (%), wind speed (m/s), pressure (hPa), and visibility (km).
- Sunrise and sunset using the searched city's UTC offset, not the computer's timezone.
- Responsive weather details, accessible search label, and loading state.
- Missing optional values display `--`; a failed icon is hidden.

Existing live AQI (OpenWeather's 1–5 scale), health tips, travel advice, clothing
recommendations, condition-based alerts, and recent-search behavior are retained.
AQI failures no longer prevent weather from appearing.

The existing suggestion rules are simple condition/temperature heuristics, not
official alerts or forecasts. Recent searches remain session-only and reset on reload;
the original example cities remain in the initial list.

## How it works

The browser requests `/api/weather?city=Villupuram`. Express reads the key from
`.env`, requests current weather and air quality, and returns only the fields the
dashboard needs. Frontend JavaScript updates the page after the response arrives.
Both the page and route use the same origin, so no additional CORS configuration
is needed. Only `public/` is exposed as static content.

## Verification

Run `npm test` for HTTP and frontend regression checks. Tests use fixed upstream
responses, so they do not require a key or consume API calls. They cover new fields,
AQI, existing suggestions/searches, time offsets, missing optional fields,
safe error responses, AQI failure, and protection of `.env` from HTTP access.

This package was also checked with Node.js 24.18.0 and a live Villupuram search.
The browser displayed the Phase 7 details, icon, AQI and existing cards, and the
narrow-screen layout was visually inspected.

## Upload to GitHub

Upload `server.js`, `package.json`, `package-lock.json`, `README.md`, `.gitignore`,
`.env.example`, and the `public/` and `test/` folders, preserving their structure.
Never upload `.env` or `node_modules/`. The ZIP excludes both.

GitHub stores the code; this Express app needs a Node.js server to run.
GitHub Pages alone cannot execute the backend.

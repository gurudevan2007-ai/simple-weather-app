const express = require('express');
const path = require('path');
const { summarizeForecast } = require('./lib/forecast');
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });
const app = express();
const PORT = process.env.PORT || 3000;
// Only public assets are served; the API key stays on the server.
app.use(express.static(path.join(__dirname, 'public')));
app.get('/api/weather', async (req, res) => {
    const city = typeof req.query.city === 'string' ? req.query.city.trim() : '';
    if (!city || city.length > 100) return res.status(400).json({ error: 'Enter a city name (up to 100 characters).' });
    const apiKey = process.env.OPENWEATHER_API_KEY || process.env.API_KEY;
    if (!apiKey) return res.status(503).json({ error: 'Weather service is not configured.' });
    try {
        const params = new URLSearchParams({ q: city, units: 'metric', appid: apiKey });
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?${params}`, { signal: AbortSignal.timeout(10000) });
        if (!response.ok) return res.status(response.status === 404 ? 404 : 502).json({ error: response.status === 404 ? 'City not found. Please check the spelling.' : 'Weather service is temporarily unavailable.' });
        const w = await response.json();
        // Fetch optional panels together; either may fail without hiding current weather.
        async function optionalData(endpoint) {
            try {
                const params = new URLSearchParams({ lat: w.coord.lat, lon: w.coord.lon, units: 'metric', appid: apiKey });
                const response = await fetch(`https://api.openweathermap.org/data/2.5/${endpoint}?${params}`, { signal: AbortSignal.timeout(10000) });
                return response.ok ? await response.json() : null;
            } catch { return null; }
        }
        const [airData, forecastData] = await Promise.all([
            optionalData('air_pollution'), optionalData('forecast')
        ]);
        const air = airData?.list?.[0];
        const forecast = summarizeForecast(forecastData, w.timezone);
        res.json({
            city: w.name, country: w.sys?.country ?? null,
            temp: w.main.temp, feelsLike: w.main.feels_like ?? null,
            condition: w.weather[0].main, description: w.weather[0].description,
            icon: w.weather[0].icon ?? null, humidity: w.main.humidity,
            pressure: w.main.pressure ?? null, wind: w.wind?.speed ?? null,
            visibility: w.visibility ?? null, sunrise: w.sys?.sunrise ?? null,
            sunset: w.sys?.sunset ?? null, timezone: w.timezone ?? null,
            aqi: air?.main?.aqi ?? null, aqiComponents: air?.components ?? null,
            forecast
        });
    } catch {
        // Upstream error objects can contain URLs with the API key. Never expose them.
        res.status(502).json({ error: 'Failed to fetch weather data. Please try again.' });
    }
});
if (require.main === module) app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
module.exports = app;

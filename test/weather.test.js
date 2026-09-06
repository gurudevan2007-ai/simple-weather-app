const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const http = require('node:http');
const express = require('express');
const root = path.resolve(__dirname, '..');
const weather = { cod: 200, name: 'Chennai', coord: { lat: 13, lon: 80 },
  main: { temp: 31, feels_like: 35, pressure: 1007, humidity: 70 },
  weather: [{ main: 'Rain', description: 'light rain', icon: '10d' }],
  wind: { speed: 2.5 }, visibility: 10000,
  sys: { country: 'IN', sunrise: 0, sunset: 43200 }, timezone: 19800 };

test('HTTP route returns Phase 7 fields and AQI; static files exclude secrets', async () => {
  const app = express();
  app.listen = () => {}; // The harness owns the test server's lifetime.
  const bindings = {
    require: name => name === 'express' ? Object.assign(() => app, express) : name === 'dotenv' ? { config() {} } : require(name),
    __dirname: root, module: { exports: {} }, process: { env: { OPENWEATHER_API_KEY: 'test-secret' } },
    console, URL, URLSearchParams, AbortSignal,
    fetch: async url => ({ ok: true, status: 200, json: async () => String(url).includes('air_pollution')
      ? { list: [{ main: { aqi: 2 }, components: { pm2_5: 8 } }] } : weather })
  };
  // Run in this realm so Express receives native promises, while replacing only upstream I/O.
  new Function(...Object.keys(bindings), fs.readFileSync(path.join(root, 'server.js'), 'utf8'))(...Object.values(bindings));
  const server = http.createServer(app).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const res = await fetch(base + '/api/weather?city=Chennai');
    assert.equal(res.status, 200);
    const data = await res.json();
    for (const [key, value] of Object.entries({ country: 'IN', feelsLike: 35, pressure: 1007,
      visibility: 10000, sunrise: 0, sunset: 43200, timezone: 19800, icon: '10d', aqi: 2, wind: 2.5 })) {
      assert.equal(data[key], value, key);
    }
    assert.equal(JSON.stringify(data).includes('test-secret'), false);
    assert.equal((await fetch(base + '/api/weather?city=%20')).status, 400);
    assert.equal((await fetch(base + '/.env')).status, 404);
    assert.equal((await fetch(base + '/')).status, 200);
  } finally { await new Promise(resolve => server.close(resolve)); }
});

test('frontend renders weather, city time, icon and preserves suggestions and searches', async () => {
  const elements = new Map();
  const element = () => ({ textContent: '', innerHTML: '', style: {}, hidden: true, children: [],
    addEventListener() {}, removeAttribute(key) { delete this[key]; }, prepend(item) { this.children.unshift(item); } });
  const context = { document: { getElementById(id) { if (!elements.has(id)) elements.set(id, element()); return elements.get(id); },
    createElement: element }, console, Date, alert: message => { throw Error(message); },
    fetch: async () => ({ ok: true, json: async () => ({ city: 'Chennai', country: 'IN', temp: 31,
      feelsLike: 35, pressure: 1007, visibility: 10000, sunrise: 0, sunset: 43200, timezone: 19800,
      humidity: 70, wind: 2.5, icon: '10d', condition: 'Rain', description: 'light rain', aqi: 2 }) }) };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, 'public/script.js'), 'utf8'), context);
  await vm.runInContext('updateWeather("Chennai")', context);
  const text = id => elements.get(id)?.textContent || elements.get(id)?.innerHTML;
  assert.match(text('location'), /Chennai.*IN/i);
  assert.match(text('feelsLike'), /35.*°C/);
  assert.match(text('visibility'), /10 km/);
  assert.match(text('sunrise'), /05:30 AM/);
  assert.match(text('wind'), /2.5 m\/s/);
  assert.equal(elements.get('weatherIcon').src, 'https://openweathermap.org/img/wn/10d@2x.png');
  assert.match(text('aqiStatus'), /Fair/);
  assert.match(text('clothes'), /Raincoat/);
  assert.match(text('healthTips'), /umbrella/);
  assert.match(text('travelAdvice'), /slippery/);
  assert.equal(elements.get('recentSearches').children[0].textContent, 'Chennai');
  assert.equal(vm.runInContext('formatCityTime(0, -18000)', context), '07:00 PM');
  assert.equal(vm.runInContext('formatCityTime(null, 19800)', context), '--');
  assert.equal(vm.runInContext('formatValue(0, " hPa")', context), '0 hPa');
  vm.runInContext('displayWeatherDetails({})', context);
  assert.equal(elements.get('weatherIcon').hidden, true);
  assert.match(text('visibility'), /--/);
});

test('upstream errors are safe and AQI outages preserve weather', async () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.OPENWEATHER_API_KEY;
  process.env.OPENWEATHER_API_KEY = 'test-secret';
  const app = require('../server');
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const url = `http://127.0.0.1:${server.address().port}/api/weather?city=Chennai`;
  try {
    for (const [upstream, expected] of [[404, 404], [401, 502], [429, 502]]) {
      global.fetch = async () => ({ ok: false, status: upstream });
      const res = await originalFetch(url);
      assert.equal(res.status, expected);
      assert.equal((await res.text()).includes('test-secret'), false);
    }
    global.fetch = async url => {
      if (String(url).includes('air_pollution')) throw Error('offline');
      return { ok: true, json: async () => weather };
    };
    const res = await originalFetch(url);
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.country, 'IN');
    assert.equal(data.aqi, null);
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.OPENWEATHER_API_KEY;
    else process.env.OPENWEATHER_API_KEY = originalKey;
    await new Promise(resolve => server.close(resolve));
  }
});

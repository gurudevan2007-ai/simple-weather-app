const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('forecast groups the next five city-local days and marks partial coverage', () => {
    const { summarizeForecast } = require('../lib/forecast');
    const start = Date.parse('2026-09-06T18:00:00Z') / 1000;
    const list = Array.from({ length: 40 }, (_, i) => ({
        dt: start + i * 10800, main: { temp: 20 + i % 8 },
        weather: [{ description: 'cloudy', icon: '04d' }], pop: i % 8 / 10
    }));
    const days = summarizeForecast({ list }, 19800, start - 3600);
    assert.equal(days.length, 5);
    assert.equal(days[0].date, '2026-09-07');
    assert.equal(days[0].low, 20);
    assert.equal(days[0].high, 27);
    assert.equal(days[0].rainChance, 70);
    assert.equal(days[0].partial, false);
    assert.equal(days[4].partial, true);
    assert.equal(summarizeForecast({ list: [] }, 19800, start).length, 0);
    assert.equal(summarizeForecast({ list }, null, start).length, 0);
    assert.equal(summarizeForecast({ list: [{ dt: start }] }, 0, start).length, 0);
    const west = summarizeForecast({ list }, -18000, start - 3600);
    assert.equal(west[0].date, '2026-09-07');
});

function frontend() {
    const elements = new Map();
    const element = () => ({ textContent: '', innerHTML: '', style: {}, dataset: {}, children: [],
        addEventListener() {}, removeAttribute(key) { delete this[key]; },
        append(...items) { this.children.push(...items); },
        replaceChildren(...items) { this.children = items; }, prepend(item) { this.children.unshift(item); } });
    const context = { document: { getElementById(id) {
        if (!elements.has(id)) elements.set(id, element()); return elements.get(id);
    }, createElement: element }, console, Date };
    vm.createContext(context);
    vm.runInContext(fs.readFileSync(require.resolve('../public/script.js'), 'utf8'), context);
    return { context, elements };
}

test('AQI advice covers every level, heat and missing data without recommending walks in polluted air', () => {
    const { context } = frontend();
    for (let index = 1; index <= 5; index++) {
        const tips = vm.runInContext(`getHealthTips('Clouds', 25, ${index})`, context).join(' ');
        assert.match(tips, /air|pollution/i);
        if (index >= 4) { assert.match(tips, /reduce|indoors/i); assert.doesNotMatch(tips, /great day|pleasant|walking/i); }
    }
    assert.match(vm.runInContext("getHealthTips('Clear', 40, 5).join(' ')", context), /heat|cool/i);
    assert.match(vm.runInContext("getHealthTips('Rain', 22, null).join(' ')", context), /unavailable/i);
    assert.match(vm.runInContext("getHealthTips('Rain', 22, 2).join(' ')", context), /umbrella/i);
});

test('forecast cards are replaced and cleared when the next city has no forecast', () => {
    const { context, elements } = frontend();
    vm.runInContext(`displayForecast([{ date: '2026-09-07', low: 20, high: 29,
        description: 'light rain', icon: '10d', rainChance: 70, partial: true }])`, context);
    const cards = elements.get('forecastCards');
    assert.equal(cards.children.length, 1);
    assert.match(cards.children[0].children.map(x => x.textContent).join(' '), /20.*29|29.*20/);
    assert.match(cards.children[0].children.map(x => x.textContent).join(' '), /Partial/);
    vm.runInContext('displayForecast([])', context);
    assert.equal(cards.children.length, 0);
    assert.match(elements.get('forecastStatus').textContent, /unavailable/i);
});

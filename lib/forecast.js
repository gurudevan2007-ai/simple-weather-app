// The free forecast contains three-hour samples, not daily summaries.
function summarizeForecast(data, offset, now = Date.now() / 1000) {
    if (!Array.isArray(data?.list) || !Number.isFinite(offset)) return [];
    const localDate = timestamp => new Date((timestamp + offset) * 1000).toISOString().slice(0, 10);
    const today = localDate(now);
    const groups = new Map();
    for (const item of data.list) {
        if (!Number.isFinite(item?.dt) || !Number.isFinite(item?.main?.temp)) continue;
        const date = localDate(item.dt);
        if (date <= today) continue;
        if (!groups.has(date)) groups.set(date, []);
        groups.get(date).push(item);
    }
    return [...groups].sort(([a], [b]) => a.localeCompare(b)).slice(0, 5).map(([date, items]) => {
        // Use the sample nearest local noon for the day's icon and description.
        const noonDistance = item => Math.abs(((item.dt + offset) % 86400 + 86400) % 86400 - 43200);
        const representative = [...items].sort((a, b) => noonDistance(a) - noonDistance(b))[0];
        const chances = items.map(x => x.pop).filter(x => Number.isFinite(x) && x >= 0 && x <= 1);
        return {
            date,
            low: Math.min(...items.map(x => x.main.temp)),
            high: Math.max(...items.map(x => x.main.temp)),
            description: representative.weather?.[0]?.description || 'Forecast unavailable',
            icon: representative.weather?.[0]?.icon ?? null,
            rainChance: chances.length ? Math.round(Math.max(...chances) * 100) : null,
            partial: new Set(items.map(x => x.dt)).size < 8
        };
    });
}
module.exports = { summarizeForecast };

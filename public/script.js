// ==============================
// Select HTML Elements
// ==============================

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const currentDate = document.getElementById("currentDate");
const locationName = document.getElementById("location");

const loading = document.getElementById("loading");

const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");

const aqi = document.getElementById("aqi");
const aqiStatus = document.getElementById("aqiStatus");

const healthTips = document.getElementById("healthTips");
const travelAdvice = document.getElementById("travelAdvice");

const clothes = document.getElementById("clothes");
const alertMessage = document.getElementById("alert");

const recentSearches = document.getElementById("recentSearches");


// ==============================
// Display Today's Date
// ==============================

const today = new Date();

currentDate.innerHTML =
"📅 " + today.toDateString();


// ==============================
// Search Button
// ==============================

searchBtn.addEventListener("click", function () {

    const city = cityInput.value.trim();

    if (city === "") {

        alert("Please enter a city name.");

        return;
    }

    loading.style.display = "block";

    updateWeather(city);

});


// ==============================
// AQI Number -> Label
// ==============================

function getAqiStatus(aqiIndex){

    const labels = {
        1: "Good",
        2: "Fair",
        3: "Moderate",
        4: "Poor",
        5: "Very Poor"
    };

    return labels[aqiIndex] || "Unknown";

}


// ==============================
// Clothing Suggestion (based on temp/condition)
// ==============================

function getClothingSuggestion(temp, condition){

    condition = condition.toLowerCase();

    if(condition.includes("rain") || condition.includes("drizzle")){
        return "🧥 Raincoat";
    }
    if(temp >= 35){
        return "🧢 Cap & Light Cotton Clothes";
    }
    if(temp >= 25){
        return "👕 T-Shirt";
    }
    if(temp >= 15){
        return "🧥 Light Jacket";
    }
    return "🧥 Heavy Jacket";

}


// ==============================
// Weather Alert
// ==============================

function getAlertMessage(temp, condition){

    condition = condition.toLowerCase();

    if(condition.includes("thunderstorm")){
        return "⚡ Thunderstorm Warning";
    }
    if(condition.includes("rain")){
        return "☔ Carry an Umbrella";
    }
    if(temp >= 40){
        return "🔥 Heat Wave Warning";
    }
    return "No Alerts";

}


// ==============================
// Update Weather (Real Data from Backend)
// ==============================

async function updateWeather(city) {
    if (searchBtn.disabled) return;
    searchBtn.disabled = true;
    loading.style.display = "block";

    try {

        const response = await fetch("/api/weather?city=" + encodeURIComponent(city));

        const data = await response.json();

        loading.style.display = "none";

        if (!response.ok) {

            alert(data.error || "City not found. Please try again.");

            return;
        }

        locationName.textContent = "📍 " + data.city + (data.country ? ", " + data.country : "");
        displayWeatherDetails(data);

        temperature.innerHTML = Math.round(data.temp) + "°C";

        condition.textContent = "Condition : " + data.description;

        humidity.innerHTML = "💧 Humidity : " + data.humidity + "%";

        wind.textContent = "🌬 Wind Speed : " + formatValue(data.wind, " m/s");

        displayAirQuality(data);
        displayForecast(data.forecast);



        clothes.innerHTML = getClothingSuggestion(data.temp, data.condition);

        alertMessage.innerHTML = getAlertMessage(data.temp, data.condition);

        updateHealthTips(data.condition, data.temp, data.aqi);

        updateTravelAdvice(data.condition);

        addRecentSearch(data.city);

    } catch (error) {

        loading.style.display = "none";

        console.error("Fetch error:", error);

        alert("Something went wrong while fetching weather data.");
    } finally {
        searchBtn.disabled = false;
        loading.style.display = "none";
    }

}


// ==============================
// Health Tips
// ==============================

function getHealthTips(condition, temp, index) {
    const airTips = {
        1: "Air quality is good. Continue to check conditions before outdoor activity.",
        2: "Air quality is fair. If you are sensitive to pollution, monitor local air-quality advice.",
        3: "Air pollution is moderate. Consider shorter, less strenuous outdoor activity if sensitive to pollution.",
        4: "Air quality is poor. Reduce prolonged or strenuous outdoor activity, especially if sensitive to pollution.",
        5: "Air quality is very poor. Consider moving exercise indoors and reducing time in polluted outdoor air."
    };
    const tips = [airTips[index] || "Air-quality data is unavailable. Check local air-quality advice before outdoor activity."];
    if (temp >= 35) tips.push("Take breaks in a cool place and drink water during hot weather.");
    if (/rain|drizzle|thunderstorm/i.test(condition)) tips.push("Carry an umbrella and wear waterproof shoes; seek shelter during thunderstorms.");
    else if (/clear|sunny/i.test(condition)) tips.push("Use sunscreen and sunglasses when outdoors in daylight.");
    else tips.push("Check local weather updates before making outdoor plans.");
    return tips;
}
function updateHealthTips(condition, temp, index) {
    // These strings are fixed application copy, never upstream HTML.
    healthTips.innerHTML = getHealthTips(condition, temp, index).map(tip => `<li>${tip}</li>`).join("");
}

// ==============================
// Travel Advice
// ==============================

function updateTravelAdvice(condition){

    if(condition.includes("Rain") || condition.includes("Thunderstorm") || condition.includes("Drizzle")){

        travelAdvice.innerHTML = `
        <li>🚗 Roads may be slippery.</li>
        <li>⏰ Leave early.</li>
        `;

    }

    else if(condition.includes("Clear") || condition.includes("Hot")){

        travelAdvice.innerHTML = `
        <li>🥤 Carry water.</li>
        <li>🌞 Avoid afternoon travel.</li>
        `;

    }

    else{

        travelAdvice.innerHTML = `
        <li>Check local road and weather conditions before travelling.</li>
        <li>😊 Enjoy your journey.</li>
        `;

    }

}


// ==============================
// Recent Searches
// ==============================

function addRecentSearch(city) {

    const item = document.createElement("li");

    item.textContent = city;

    recentSearches.prepend(item);

}


// ==============================
// Press Enter to Search
// ==============================

cityInput.addEventListener("keypress", function(event){

    if(event.key === "Enter"){

        searchBtn.click();

    }

});
// Phase 7: API text is never interpreted as HTML.
function formatValue(value, unit, round = false) {
    return Number.isFinite(value) ? (round ? Math.round(value) : value) + unit : "--";
}
function formatCityTime(timestamp, offset) {
    if (!Number.isFinite(timestamp) || !Number.isFinite(offset)) return "--";
    // Shift by the city's offset, then format as UTC to avoid the browser timezone.
    return new Date((timestamp + offset) * 1000).toLocaleTimeString("en-US", {
        timeZone: "UTC", hour: "2-digit", minute: "2-digit", hour12: true
    });
}
function displayWeatherDetails(data) {
    const values = {
        country: "🌍 Country : " + (data.country || "--"),
        feelsLike: "🤗 Feels Like : " + formatValue(data.feelsLike, "°C", true),
        pressure: "📊 Pressure : " + formatValue(data.pressure, " hPa"),
        visibility: "👁 Visibility : " + (Number.isFinite(data.visibility) ? data.visibility / 1000 + " km" : "--"),
        sunrise: "🌅 Sunrise : " + formatCityTime(data.sunrise, data.timezone),
        sunset: "🌇 Sunset : " + formatCityTime(data.sunset, data.timezone)
    };
    for (const [id, value] of Object.entries(values)) document.getElementById(id).textContent = value;
    const icon = document.getElementById("weatherIcon");
    const validIcon = /^(01|02|03|04|09|10|11|13|50)[dn]$/.test(data.icon);
    icon.hidden = !validIcon;
    if (validIcon) {
        icon.src = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;
        icon.alt = data.description || "Current weather";
    } else icon.removeAttribute("src");
    icon.onerror = () => { icon.hidden = true; };
}

// OpenWeather uses its own 1–5 scale, not the US or Indian numeric AQI.
function displayAirQuality(data) {
    const valid = Number.isInteger(data.aqi) && data.aqi >= 1 && data.aqi <= 5;
    aqi.textContent = valid ? `AQI : ${data.aqi} / 5` : "AQI : --";
    aqiStatus.textContent = valid ? "Status : " + getAqiStatus(data.aqi) : "Status : Unavailable";
    aqiStatus.dataset.level = valid ? String(data.aqi) : "unknown";
    document.getElementById("pm25").textContent = "PM2.5 : " + formatValue(data.aqiComponents?.pm2_5, " µg/m³");
    document.getElementById("pm10").textContent = "PM10 : " + formatValue(data.aqiComponents?.pm10, " µg/m³");
}

function displayForecast(days) {
    const container = document.getElementById("forecastCards");
    const status = document.getElementById("forecastStatus");
    container.replaceChildren();
    if (!Array.isArray(days) || !days.length) {
        status.textContent = "Forecast temporarily unavailable for this city. Try searching again.";
        return;
    }
    status.textContent = "";
    for (const day of days) {
        const card = document.createElement("article");
        card.className = "forecast-day";
        const add = (tag, text) => {
            const element = document.createElement(tag);
            element.textContent = text;
            card.append(element);
        };
        add("h3", new Date(day.date + "T12:00:00Z").toLocaleDateString("en-US", {
            timeZone: "UTC", weekday: "short", month: "short", day: "numeric"
        }));
        if (/^(01|02|03|04|09|10|11|13|50)[dn]$/.test(day.icon)) {
            const icon = document.createElement("img");
            icon.src = `https://openweathermap.org/img/wn/${day.icon}@2x.png`;
            icon.alt = day.description;
            icon.width = 64; icon.height = 64;
            icon.onerror = () => { icon.hidden = true; };
            card.append(icon);
        }
        add("p", day.description);
        add("p", "High " + formatValue(day.high, "°C", true) + " · Low " + formatValue(day.low, "°C", true));
        add("p", "Peak rain chance: " + formatValue(day.rainChance, "%"));
        if (day.partial) add("small", "Partial-day coverage");
        container.append(card);
    }
}

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

        aqi.innerHTML = "AQI : " + (data.aqi ?? "--");

        aqiStatus.innerHTML = "Status : " + getAqiStatus(data.aqi);

        clothes.innerHTML = getClothingSuggestion(data.temp, data.condition);

        alertMessage.innerHTML = getAlertMessage(data.temp, data.condition);

        updateHealthTips(data.condition);

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

function updateHealthTips(condition){

    if(condition.includes("Clear") || condition.includes("Sunny") || condition.includes("Hot")){

        healthTips.innerHTML = `
        <li>💧 Drink plenty of water.</li>
        <li>🧴 Apply sunscreen.</li>
        <li>😎 Wear sunglasses.</li>
        `;

    }

    else if(condition.includes("Rain")){

        healthTips.innerHTML = `
        <li>☔ Carry an umbrella.</li>
        <li>👟 Wear waterproof shoes.</li>
        <li>🤧 Avoid getting soaked.</li>
        `;

    }

    else{

        healthTips.innerHTML = `
        <li>😊 Weather looks pleasant.</li>
        <li>🚶 Great day for walking.</li>
        `;

    }

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
        <li>🚶 Safe for travelling.</li>
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

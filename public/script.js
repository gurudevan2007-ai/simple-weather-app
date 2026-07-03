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

    setTimeout(function () {

        loading.style.display = "none";

        updateWeather(city);

    }, 2000);

});


// ==============================
// Update Weather (Dummy Data)
// ==============================

function updateWeather(city) {

    city = city.toLowerCase();

    let weatherData = {

        chennai: {
            temp: "35°C",
            condition: "☀️ Sunny",
            humidity: "70%",
            wind: "18 km/h",
            aqi: "85",
            status: "Moderate",
            clothes: "👕 T-Shirt",
            alert: "Stay Hydrated"
        },

        delhi: {
            temp: "41°C",
            condition: "🔥 Very Hot",
            humidity: "45%",
            wind: "10 km/h",
            aqi: "180",
            status: "Poor",
            clothes: "🧢 Cap",
            alert: "Heat Wave Warning"
        },

        mumbai: {
            temp: "29°C",
            condition: "🌧 Rainy",
            humidity: "90%",
            wind: "22 km/h",
            aqi: "70",
            status: "Good",
            clothes: "🧥 Raincoat",
            alert: "Carry an Umbrella"
        },

        london: {
            temp: "18°C",
            condition: "☁️ Cloudy",
            humidity: "65%",
            wind: "12 km/h",
            aqi: "35",
            status: "Excellent",
            clothes: "🧥 Jacket",
            alert: "No Alerts"
        }

    };

    if(weatherData[city]){

        let data = weatherData[city];

        locationName.innerHTML = "📍 " + city.toUpperCase();

        temperature.innerHTML = data.temp;

        condition.innerHTML = data.condition;

        humidity.innerHTML = "💧 Humidity : " + data.humidity;

        wind.innerHTML = "🌬 Wind : " + data.wind;

        aqi.innerHTML = "AQI : " + data.aqi;

        aqiStatus.innerHTML = "Status : " + data.status;

        clothes.innerHTML = data.clothes;

        alertMessage.innerHTML = data.alert;

        updateHealthTips(data.condition);

        updateTravelAdvice(data.condition);

        addRecentSearch(city);

    }

    else{

        alert("City not found. Try Chennai, Delhi, Mumbai or London.");

    }

}


// ==============================
// Health Tips
// ==============================

function updateHealthTips(condition){

    if(condition.includes("Sunny") || condition.includes("Hot")){

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

    if(condition.includes("Rain")){

        travelAdvice.innerHTML = `
        <li>🚗 Roads may be slippery.</li>
        <li>⏰ Leave early.</li>
        `;

    }

    else if(condition.includes("Hot")){

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
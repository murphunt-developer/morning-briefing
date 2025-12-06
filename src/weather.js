import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.WEATHER_API_KEY;

const fetchData = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
}

/**
 * Converts Kelvin to Celsius (and rounds to the nearest integer).
 * @param {number} K - Temperature in Kelvin.
 * @returns {string} Temperature string in Celsius, e.g., "23°C".
 */
const kelvinToCelsius = (K) => `${Math.round(K - 273.15)}°C`;

/**
 * Converts meteorological degrees (0-360) to a cardinal direction string.
 * @param {number} deg - Wind direction in degrees.
 * @returns {string} Cardinal or intercardinal direction (e.g., "NW", "SE").
 */
const degToDirection = (deg) => {
    const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    const index = Math.round((deg % 360) / 22.5);
    return directions[index % 16];
};

/**
 * Formats the raw forecast data into an HTML block,
 * limited to the first day of the forecast data.
 * @param {Object} data - The raw forecast data object.
 * @returns {string} The fully formatted HTML output.
 */
const formatHourlyForecast = (data) => {
    if (data.cod !== "200" || !data.list || data.list.length === 0) {
        return "<p style='color: red;'>Error: Forecast data is unavailable or invalid.</p>";
    }

    // --- Determine the target day for the forecast ---
    // (Existing logic preserved to filter by day)
    const targetDayStr = data.list[0].dt_txt.substring(0, 10);
    const filteredList = data.list.filter(item => item.dt_txt.startsWith(targetDayStr));

    if (filteredList.length === 0) {
        return `<p>No forecast data available for the current day (${targetDayStr}).</p>`;
    }

    const cityName = data.city.name;
    const forecastDate = new Date(targetDayStr);
    const formattedDate = forecastDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    // --- Header Section - Now using HTML ---
    let output = `<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333;">`;
    output += `<h3 style="color: #007bff; margin-bottom: 5px;">Hourly Forecast for ${cityName}</h3>`;
    output += `<p style="font-weight: bold; margin-top: 0;">Date: ${formattedDate}</p>`;
    output += `<p style="font-style: italic; font-size: 12px;">(All temperatures are in Celsius)</p>`;
    output += `<hr style="border: 0; border-top: 1px solid #ddd; margin: 10px 0;">`;

    // --- Forecast Body ---
    filteredList.forEach(item => {
        const date = new Date(item.dt_txt);
        const timeString = date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true 
        });
        const dayString = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        const tempC = kelvinToCelsius(item.main.temp);
        const description = item.weather[0].description;
        const windSpeed = item.wind.speed.toFixed(1); // m/s
        const windDir = degToDirection(item.wind.deg);
        const pop = Math.round(item.pop * 100); // Probability of precipitation

        // Format for each hour using HTML lists and spans for structure
        output += `<div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px dashed #eee;">`;
        output += `<p style="font-weight: bold; margin: 0;">${dayString} ${timeString}</p>`;
        output += `<ul style="list-style: none; padding-left: 15px; margin: 5px 0;">`;
        output += `<li>🌡️ Temp: <span style="font-weight: bold;">${tempC}</span> (Feels like: ${kelvinToCelsius(item.main.feels_like)})</li>`;
        output += `<li>☁️ Condition: ${description.charAt(0).toUpperCase() + description.slice(1)}</li>`;
        output += `<li>💨 Wind: ${windSpeed} m/s from ${windDir}</li>`;
        output += `<li>💧 Humidity: ${item.main.humidity}%, Rain Chance: ${pop}%</li>`;
        output += `</ul>`;
        output += `</div>`;
    });
    
    output += `</div>`;
    return output;
};

/**
 * Builds the weather forcast for mission viejo
 * @returns 
 */
export const buildWeatherForcast = async (city) => {
  const latlon = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${API_KEY}`;

  const data = await fetchData(latlon);
  const lat = data[0].lat;
  const lon = data[0].lon;

  const hourlyForcast = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  const forcastData = await fetchData(hourlyForcast);

  // --- Execution ---
  const forecastText = formatHourlyForecast(forcastData);
  return forecastText; // This now returns an HTML string
}
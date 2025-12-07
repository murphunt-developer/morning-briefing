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
 * Converts Kelvin to Fahrenheit (and rounds to the nearest integer).
 * @param {number} K - Temperature in Kelvin.
 * @returns {string} Temperature string in Fahrenheit, e.g., "73°F".
 */
const kelvinToFahrenheit = (K) => `${Math.round((K - 273.15) * 9/5 + 32)}°F`;

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
 * Function to get a simple icon/emoji based on weather condition.
 */
const getConditionIcon = (desc) => {
    if (desc.includes("rain") || desc.includes("drizzle")) return "🌧️";
    if (desc.includes("cloud") && desc.includes("sun")) return "🌤️";
    if (desc.includes("cloud")) return "☁️";
    if (desc.includes("clear")) return "☀️";
    if (desc.includes("snow")) return "❄️";
    if (desc.includes("mist") || desc.includes("fog")) return "🌫️";
    return "---";
};

/**
 * Formats the raw forecast data into an HTML block using a horizontal table structure
 * to ensure reliable rendering and scrolling on mobile email clients.
 * @param {Object} data - The raw forecast data object.
 * @returns {string} The fully formatted HTML output.
 */
const formatHourlyForecast = (data) => {
    if (data.cod !== "200" || !data.list || data.list.length === 0) {
        return "<p style='color: red;'>Error: Forecast data is unavailable or invalid.</p>";
    }

    // --- Determine the target day for the forecast ---
    const targetDayStr = data.list[0].dt_txt.substring(0, 10);
    const filteredList = data.list.filter(item => item.dt_txt.startsWith(targetDayStr));

    if (filteredList.length === 0) {
        return `<p>No forecast data available for the current day (${targetDayStr}).</p>`;
    }

    const cityName = data.city.name;
    const forecastDate = new Date(targetDayStr);
    const formattedDate = forecastDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    // --- Outer Container (Wrapper for Scroll) ---
    // Added padding and border styles to the wrapper div
    let output = `<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.4; color: #333; padding: 10px; border-radius: 8px;">`;
    
    // --- Header Section ---
    output += `<h3 style="color: #007bff; margin: 0 0 5px 0; font-size: 16px;">Hourly Forecast for ${cityName}</h3>`;
    output += `<p style="font-weight: bold; margin: 0 0 10px 0; font-size: 12px;">${formattedDate} | All temperatures in Fahrenheit</p>`;
    
    // --- Forecast Body (Horizontal Scroll Container using Table) ---
    // The outer div handles overflow.
    output += `<div style="overflow-x: auto; padding-bottom: 10px; -webkit-overflow-scrolling: touch; scrollbar-width: none; /* Firefox */ -ms-overflow-style: none; /* IE and Edge */">`;
    output += `<style> .horizontal-scroll-container::-webkit-scrollbar { display: none; } </style>`;

    // The inner table has a fixed width (120px * 8 items = 960px) to guarantee horizontal layout and scroll
    output += `<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%; min-width: 900px;"><tr>`;

    filteredList.forEach(item => {
        const date = new Date(item.dt_txt);
        const timeString = date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            hour12: true 
        });

        const tempF = kelvinToFahrenheit(item.main.temp);
        const description = item.weather[0].description;
        const windSpeed = item.wind.speed.toFixed(0); 
        const windDir = degToDirection(item.wind.deg);
        const pop = Math.round(item.pop * 100); 
        
        // --- Single Hour Block (Table Cell) ---
        // Use TD for guaranteed horizontal layout
        output += `<td style="width: 120px; padding: 0 7.5px; vertical-align: top;">`; 
        
        // Inner forecast content DIV for styling
        output += `<div style="text-align: center; padding: 10px; border: 1px solid #ddd; border-radius: 6px; background-color: #f9f9f9; height: 100%;">`;
        
        // Time
        output += `<div style="font-weight: bold; font-size: 14px; color: #0056b3; margin-bottom: 5px;">${timeString.replace(/\s/g, '')}</div>`;
        
        // Icon/Temperature
        output += `<div style="font-size: 24px; line-height: 1;">${getConditionIcon(description)}</div>`;
        output += `<div style="font-size: 18px; font-weight: bold; color: #333; margin-bottom: 5px;">${tempF}</div>`;
        
        // Description/Details
        output += `<div style="font-size: 12px; color: #666; margin-bottom: 3px;">${description.charAt(0).toUpperCase() + description.slice(1)}</div>`;
        output += `<div style="font-size: 11px; color: #888;">🌬️ ${windSpeed}m/s from ${windDir}</div>`;
        output += `<div style="font-size: 11px; color: ${pop > 50 ? 'red' : '#888'};">💧 ${pop}% Rain</div>`;
        
        output += `</div>`; // Close inner div
        output += `</td>`; // Close TD
    });
    
    // Close the horizontal table and wrapper div
    output += `</tr></table>`;
    output += `</div>`; // Close overflow div

    // Close the main container
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
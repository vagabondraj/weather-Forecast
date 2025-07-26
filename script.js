const API_KEY = 'f394a9e8b0dc3524359838b54f4fb83b'; // Replace with your OpenWeatherMap key
let unit = 'metric'; // default Celsius

window.onload = () => {
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark');
    document.getElementById('darkModeToggle').checked = true;
  }

  if (localStorage.getItem('unit') === 'imperial') {
    unit = 'imperial';
    document.getElementById('unitToggle').checked = true;
  }

  const lastCity = localStorage.getItem('lastCity');
  if (lastCity) {
    document.getElementById('cityInput').value = lastCity;
    getWeather();
  }
};

function toggleDarkMode() {
  const enabled = document.getElementById('darkModeToggle').checked;
  document.body.classList.toggle('dark', enabled);
  localStorage.setItem('darkMode', enabled);
}

function toggleUnits() {
  unit = document.getElementById('unitToggle').checked ? 'imperial' : 'metric';
  localStorage.setItem('unit', unit);
  getWeather();
}

function getWeather() {
  const city = document.getElementById('cityInput').value.trim();
  if (!city) return;

  localStorage.setItem('lastCity', city);

  fetchWeather(city);
  fetchForecast(city);
}

function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      fetchWeatherByCoords(latitude, longitude);
      fetchForecastByCoords(latitude, longitude);
    }, err => {
      alert('Could not get location');
    });
  }
}

async function fetchWeather(city) {
  const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${unit}`);
  const data = await res.json();
  showWeather(data);
}

async function fetchForecast(city) {
  const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${unit}`);
  const data = await res.json();
  showForecast(data);
}

async function fetchWeatherByCoords(lat, lon) {
  const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`);
  const data = await res.json();
  document.getElementById('cityInput').value = data.name;
  showWeather(data);
}

async function fetchForecastByCoords(lat, lon) {
  const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`);
  const data = await res.json();
  showForecast(data);
}

function showWeather(data) {
  if (data.cod !== 200) {
    document.getElementById('result').innerHTML = `<p>❌ ${data.message}</p>`;
    return;
  }

  const temp = data.main.temp;
  const unitSymbol = unit === 'metric' ? '°C' : '°F';
  const html = `
    <h3>📍 ${data.name}, ${data.sys.country}</h3>
    <p>🌡️ Temperature: ${temp}${unitSymbol}</p>
    <p>💧 Humidity: ${data.main.humidity}%</p>
    <p>🌬️ Wind Speed: ${data.wind.speed} ${unit === 'metric' ? 'm/s' : 'mph'}</p>
    <p>☁️ ${data.weather[0].main} - ${data.weather[0].description}</p>
  `;
  document.getElementById('result').innerHTML = html;
}

function showForecast(data) {
  if (!data.list) return;

  const forecastDiv = document.getElementById('forecast');
  forecastDiv.innerHTML = `<h3>📆 5-Day Forecast</h3>`;

  const dailyData = {};

  for (let item of data.list) {
    const date = item.dt_txt.split(' ')[0];
    if (!dailyData[date]) {
      dailyData[date] = item;
    }
  }

  Object.keys(dailyData).slice(0, 5).forEach(date => {
    const item = dailyData[date];
    forecastDiv.innerHTML += `
      <div class="forecast-day">
        <strong>${date}</strong><br/>
        🌡️ ${item.main.temp} ${unit === 'metric' ? '°C' : '°F'}<br/>
        ☁️ ${item.weather[0].description}
      </div>
    `;
  });
}

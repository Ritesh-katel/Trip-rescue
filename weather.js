const FALLBACK_ICON = "https://openweathermap.org/img/wn/03d@2x.png";
const wmoMap = {
  0: { text: "Clear sky", icon: "https://openweathermap.org/img/wn/01d@2x.png" },
  1: { text: "Mainly clear", icon: "https://openweathermap.org/img/wn/02d@2x.png" },
  2: { text: "Partly cloudy", icon: "https://openweathermap.org/img/wn/03d@2x.png" },
  3: { text: "Overcast", icon: "https://openweathermap.org/img/wn/04d@2x.png" },
  45: { text: "Fog", icon: "https://openweathermap.org/img/wn/50d@2x.png" },
  48: { text: "Depositing rime fog", icon: "https://openweathermap.org/img/wn/50d@2x.png" },
  51: { text: "Light drizzle", icon: "https://openweathermap.org/img/wn/09d@2x.png" },
  53: { text: "Moderate drizzle", icon: "https://openweathermap.org/img/wn/09d@2x.png" },
  55: { text: "Dense drizzle", icon: "https://openweathermap.org/img/wn/09d@2x.png" },
  56: { text: "Light freezing drizzle", icon: "https://openweathermap.org/img/wn/13d@2x.png" },
  57: { text: "Dense freezing drizzle", icon: "https://openweathermap.org/img/wn/13d@2x.png" },
  61: { text: "Slight rain", icon: "https://openweathermap.org/img/wn/10d@2x.png" },
  63: { text: "Moderate rain", icon: "https://openweathermap.org/img/wn/10d@2x.png" },
  65: { text: "Heavy rain", icon: "https://openweathermap.org/img/wn/10d@2x.png" },
  66: { text: "Light freezing rain", icon: "https://openweathermap.org/img/wn/13d@2x.png" },
  67: { text: "Heavy freezing rain", icon: "https://openweathermap.org/img/wn/13d@2x.png" },
  71: { text: "Slight snow fall", icon: "https://openweathermap.org/img/wn/13d@2x.png" },
  73: { text: "Moderate snow fall", icon: "https://openweathermap.org/img/wn/13d@2x.png" },
  75: { text: "Heavy snow fall", icon: "https://openweathermap.org/img/wn/13d@2x.png" },
  77: { text: "Snow grains", icon: "https://openweathermap.org/img/wn/13d@2x.png" },
  80: { text: "Slight rain showers", icon: "https://openweathermap.org/img/wn/09d@2x.png" },
  81: { text: "Moderate rain showers", icon: "https://openweathermap.org/img/wn/09d@2x.png" },
  82: { text: "Violent rain showers", icon: "https://openweathermap.org/img/wn/09d@2x.png" },
  85: { text: "Slight snow showers", icon: "https://openweathermap.org/img/wn/13d@2x.png" },
  86: { text: "Heavy snow showers", icon: "https://openweathermap.org/img/wn/13d@2x.png" },
  95: { text: "Thunderstorm", icon: "https://openweathermap.org/img/wn/11d@2x.png" },
  96: { text: "Thunderstorm with hail", icon: "https://openweathermap.org/img/wn/11d@2x.png" },
  99: { text: "Thunderstorm with heavy hail", icon: "https://openweathermap.org/img/wn/11d@2x.png" }
};

const appState = {
  unit: 'C',
  currentMetric: 'temp',
  rawWeatherData: null,
  chartInstance: null,
  searchDebounceTimer: null
};

document.addEventListener("DOMContentLoaded", () => {
  initChart();
  setupEventListeners();
  getLocationWeather();
});

function initChart() {
  const ctx = document.getElementById('hourlyChart').getContext('2d');
  appState.chartInstance = new Chart(ctx, {
    type: 'line',
    data: { 
      labels: [], 
      datasets: [{ 
        data: [], 
        borderColor: '#1a73e8', 
        backgroundColor: 'rgba(26, 115, 232, 0.1)', 
        fill: true, 
        tension: 0.4 
      }] 
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: { display: false }
      }
    }
  });
}

function setupEventListeners() {
  document.getElementById('geoBtn').addEventListener('click', getLocationWeather);
  document.getElementById('searchBtn').addEventListener('click', triggerSearch);
  document.getElementById('unitC').addEventListener('click', () => switchUnit('C'));
  document.getElementById('unitF').addEventListener('click', () => switchUnit('F'));

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', (e) => switchMetric(e.target.dataset.metric, e.target));
  });

  const cityInput = document.getElementById('cityInput');
  cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') triggerSearch();
  });

  cityInput.addEventListener('input', handleSearchInput);
}

async function fetchWeatherData(lat, lon, locationName) {
  document.getElementById('cityName').innerText = locationName;

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,is_day&hourly=temperature_2m,precipitation_probability,wind_speed_10m&daily=weather_code,temperature_2m_max&timezone=auto`
    );
    appState.rawWeatherData = await response.json();

    const isDay = appState.rawWeatherData.current.is_day === 1;
    document.body.classList.toggle('night-theme', !isDay);

    renderUI();
  } catch (err) {
    console.error("Weather data fetch garda error aayo:", err);
  }
}

function renderUI() {
  const data = appState.rawWeatherData;
  if (!data) return;

  const tempC = Math.round(data.current.temperature_2m);
  const displayTemp = appState.unit === 'C' ? tempC : Math.round((tempC * 9)/5 + 32);
  document.getElementById('tempValue').innerText = displayTemp;

  const code = data.current.weather_code;
  const condition = wmoMap[code] || { text: "Cloudy", icon: FALLBACK_ICON };

  document.getElementById('conditionText').innerText = condition.text;
  
  const mainIcon = document.getElementById('weatherIcon');
  mainIcon.onerror = () => { mainIcon.src = FALLBACK_ICON; };
  mainIcon.src = condition.icon;

  document.getElementById('humidityValue').innerText = `${data.current.relative_humidity_2m}%`;
  document.getElementById('precipValue').innerText = `${data.current.precipitation} mm`;
  document.getElementById('windValue').innerText = `${Math.round(data.current.wind_speed_10m)} km/h`;

  const now = new Date();
  document.getElementById('dateTime').innerText = now.toLocaleDateString('en-US', { weekday: 'long', hour: 'numeric', minute: 'numeric', hour12: true });

  renderChart();

  const forecastRow = document.getElementById('forecastRow');
  forecastRow.innerHTML = '';
  data.daily.time.forEach((dayStr, i) => {
    const date = new Date(dayStr);
    const dayName = i === 0 ? "Today" : date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayCode = data.daily.weather_code[i];
    const dayCondition = wmoMap[dayCode] || { text: "Cloudy", icon: FALLBACK_ICON };
    
    const maxTempC = Math.round(data.daily.temperature_2m_max[i]);
    const maxTemp = appState.unit === 'C' ? maxTempC : Math.round((maxTempC * 9)/5 + 32);

    forecastRow.innerHTML += `
      <div class="forecast-day">
        <span class="day-name">${dayName}</span>
        <img src="${dayCondition.icon}" alt="weather" onerror="this.onerror=null; this.src='${FALLBACK_ICON}';" />
        <span class="day-temp">${maxTemp}°</span>
      </div>
    `;
  });
}

function renderChart() {
  const hourly = appState.rawWeatherData.hourly;
  const next24Hours = hourly.time.slice(0, 24);

  const labels = next24Hours.map(t => new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }));
  let values = [];
  let color = '#1a73e8';

  if (appState.currentMetric === 'temp') {
    values = hourly.temperature_2m.slice(0, 24).map(t => appState.unit === 'C' ? Math.round(t) : Math.round((t * 9)/5 + 32));
    color = '#1a73e8';
  } else if (appState.currentMetric === 'precip') {
    values = hourly.precipitation_probability.slice(0, 24);
    color = '#34a853';
  } else if (appState.currentMetric === 'wind') {
    values = hourly.wind_speed_10m.slice(0, 24).map(w => Math.round(w));
    color = '#fbbc04';
  }

appState.chartInstance.data.labels = labels;
  appState.chartInstance.data.datasets[0].data = values;
  appState.chartInstance.data.datasets[0].borderColor = color;
  appState.chartInstance.data.datasets[0].backgroundColor = color + '22';
  appState.chartInstance.update();
}

function switchUnit(unit) {
  if (appState.unit === unit) return;
  appState.unit = unit;
  document.getElementById('unitC').classList.toggle('active', unit === 'C');
  document.getElementById('unitF').classList.toggle('active', unit === 'F');
  renderUI();
}

function switchMetric(metric, element) {
  appState.currentMetric = metric;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  element.classList.add('active');
  renderChart();
}

function getLocationWeather() {
  if (!navigator.geolocation) return alert('Geolocation is not supported by your browser.');
  
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    try {
      // Nominatim API call specific User-Agent request header sanga 
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
        headers: { 'User-Agent': 'WeatherAppPro/1.0' }
      });
      const data = await res.json();
      const city = data.address.city || data.address.town || data.address.village || "Your Location";
      fetchWeatherData(latitude, longitude, city);
    } catch {
      fetchWeatherData(latitude, longitude, "Your Location");
    }
  }, () => {
    fetchWeatherData(51.5074, -0.1278, "London");
  });
}

function handleSearchInput(e) {
  clearTimeout(appState.searchDebounceTimer);
  const query = e.target.value.trim();
  const suggestionsBox = document.getElementById('suggestions');

  if (query.length < 3) {
    suggestionsBox.style.display = 'none';
    return;
  }
  appState.searchDebounceTimer = setTimeout(async () => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`, {
        headers: { 'User-Agent': 'WeatherAppPro/1.0' }
      });
      const results = await res.json();

      if (results.length === 0) {
        suggestionsBox.style.display = 'none';
        return;
      }

      suggestionsBox.innerHTML = '';
      results.forEach(place => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.innerText = place.display_name;
        item.onclick = () => {
          const shortName = place.display_name.split(',')[0];
          document.getElementById('cityInput').value = shortName;
          suggestionsBox.style.display = 'none';
          fetchWeatherData(place.lat, place.lon, shortName);
        };
        suggestionsBox.appendChild(item);
      });
      suggestionsBox.style.display = 'block';
    } catch (e) {
      suggestionsBox.style.display = 'none';
    }
  }, 300);
}

function triggerSearch() {
  const city = document.getElementById('cityInput').value.trim();
  if (!city) return;

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`, {
    headers: { 'User-Agent': 'WeatherAppPro/1.0' }
  })
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        document.getElementById('suggestions').style.display = 'none';
        fetchWeatherData(data[0].lat, data[0].lon, data[0].display_name.split(',')[0]);
      }
    });
}
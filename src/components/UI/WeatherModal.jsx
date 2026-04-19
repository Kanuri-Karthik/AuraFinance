import { useState } from 'react';
import { Search, MapPin, Wind, Droplets, Thermometer, AlertCircle, CloudSun, Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog } from 'lucide-react';
import Modal from './Modal';

// WMO Weather code mapping for Open-Meteo
const getWeatherDetails = (code) => {
  if (code === 0) return { desc: 'Clear sky', icon: Sun };
  if (code === 1 || code === 2) return { desc: 'Partly cloudy', icon: CloudSun };
  if (code === 3) return { desc: 'Overcast', icon: Cloud };
  if (code === 45 || code === 48) return { desc: 'Fog', icon: CloudFog };
  if (code >= 51 && code <= 67) return { desc: 'Rain', icon: CloudRain };
  if (code >= 71 && code <= 77) return { desc: 'Snow', icon: CloudSnow };
  if (code >= 80 && code <= 82) return { desc: 'Rain showers', icon: CloudRain };
  if (code >= 85 && code <= 86) return { desc: 'Snow showers', icon: CloudSnow };
  if (code >= 95 && code <= 99) return { desc: 'Thunderstorm', icon: CloudLightning };
  return { desc: 'Unknown', icon: CloudSun };
};

const WeatherModal = ({ isOpen, onClose }) => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError('');
    setWeatherData(null);

    try {
      // 1. Geocoding API to get coordinates from city name (Free, No API Key needed)
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
      const geoData = await geoRes.json();
      
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error(`City "${city}" not found.`);
      }

      const location = geoData.results[0];
      
      // 2. Weather API using coordinates (Free, No API Key needed)
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto`);
      const weatherStats = await weatherRes.json();
      
      if (weatherStats.error) {
        throw new Error('Failed to fetch weather data.');
      }

      const current = weatherStats.current;
      const details = getWeatherDetails(current.weather_code);

      setWeatherData({
        name: location.name,
        country: location.country_code,
        temp: current.temperature_2m,
        feels_like: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        wind: (current.wind_speed_10m / 3.6).toFixed(1), // Convert km/h back to m/s for continuity
        desc: details.desc,
        IconComponent: details.icon
      });

    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Network error. Please try again.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Live Weather (Free)">
      <div className="space-y-6">
        <form onSubmit={fetchWeather} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Search global locations..."
              className="w-full bg-white/60 border-2 border-sky-100 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-400 focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>
          <button 
            type="submit" 
            disabled={!city.trim() || loading}
            className="h-[52px] px-6 bg-gradient-to-br from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_8px_20px_rgba(14,165,233,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? '...' : 'Find'}
          </button>
        </form>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm font-bold p-4 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {weatherData && (
          <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-sky-300/20 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-sky-200" />
                    <h2 className="text-lg font-black tracking-wide">{weatherData.name}, {weatherData.country}</h2>
                  </div>
                  <p className="text-sky-100 text-xs font-bold uppercase tracking-widest ml-6">{weatherData.desc}</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                  {weatherData.IconComponent && <weatherData.IconComponent className="w-8 h-8 text-white" />}
                </div>
              </div>

              <div className="flex items-end gap-2">
                <span className="text-6xl font-black tracking-tighter">{Math.round(weatherData.temp)}°</span>
                <span className="text-sky-100 font-bold mb-2 text-lg">C</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex items-center gap-3">
                  <Wind className="w-5 h-5 text-sky-200" />
                  <div>
                    <p className="text-[10px] text-sky-200 font-bold uppercase tracking-widest">Wind</p>
                    <p className="font-black text-sm">{weatherData.wind} m/s</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex items-center gap-3">
                  <Droplets className="w-5 h-5 text-sky-200" />
                  <div>
                    <p className="text-[10px] text-sky-200 font-bold uppercase tracking-widest">Humidity</p>
                    <p className="font-black text-sm">{weatherData.humidity}%</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex items-center gap-3 col-span-2">
                   <Thermometer className="w-5 h-5 text-sky-200" />
                  <div>
                    <p className="text-[10px] text-sky-200 font-bold uppercase tracking-widest">Feels Like</p>
                    <p className="font-black text-sm">{Math.round(weatherData.feels_like)}°C</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!weatherData && !error && !loading && (
          <div className="h-48 rounded-3xl border-2 border-dashed border-sky-100 flex flex-col items-center justify-center text-slate-400 bg-white/40">
            <CloudSun className="w-12 h-12 mb-3 text-sky-200" />
            <p className="text-sm font-bold">Search a city to see live weather</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default WeatherModal;

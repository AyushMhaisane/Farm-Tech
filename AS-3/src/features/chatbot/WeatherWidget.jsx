import React, { useState, useEffect } from 'react';

const WeatherWidget = () => {
    const [weather, setWeather] = useState(null);

    useEffect(() => {
        // In a real app, you'd fetch this from your backend
        // For the demo, let's assume Pune weather
        fetch('http://localhost:3000/api/weather')
            .then(res => res.json())
            .then(data => setWeather(data));
    }, []);

    if (!weather) return null;

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-green-100 flex items-center gap-4">
            <div className="text-3xl">
                {weather.description.includes('rain') ? '🌧️' : '☀️'}
            </div>
            <div>
                <h3 className="font-bold text-gray-800">Pune Weather</h3>
                <p className="text-xs text-gray-500 capitalize">{weather.description} • {weather.temp}°C</p>
            </div>
            {weather.humidity > 80 && (
                <div className="ml-auto bg-red-50 text-red-600 text-[10px] px-2 py-1 rounded-full font-bold animate-pulse">
                    ⚠️ Fungal Risk High
                </div>
            )}
        </div>
    );
};

export default WeatherWidget;
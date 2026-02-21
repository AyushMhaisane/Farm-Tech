import { useState, useEffect } from 'react';
import axios from 'axios';

const Gamification = () => {
    const [guess, setGuess] = useState(20);
    const [crop, setCrop] = useState('wheat');
    const [data, setData] = useState([]);
    const [weather, setWeather] = useState([]);
    const [weatherError, setWeatherError] = useState("");
    const [dayIndex, setDayIndex] = useState(0);
    const [gameState, setGameState] = useState('ORACLE');
    const [stats, setStats] = useState({ coins: 100, xp: 0, level: 'Novice', efficiency: 100 });

    // Fetch Weather on Load
    useEffect(() => {
        // UPDATED: Changed port from 5000 to 3000 to match your unified master backend
        axios.get(`http://localhost:3000/api/gamification/weather?lat=18.52&lon=73.85`)
            .then(res => {
                setWeather(res.data);
                setWeatherError("");
            })
            .catch(err => {
                console.error(err);
                setWeatherError("🚨 Could not connect to backend. Did you mount the gamification routes?");
            });
    }, []);

    const runAdvancedSimulation = async () => {
        try {
            // UPDATED: Changed port from 5000 to 3000
            const res = await axios.get(`http://localhost:3000/api/gamification/simulate?lat=18.52&lon=73.85&plannedWater=${guess}&cropType=${crop}`);

            const sim = res.data.forecast;
            const efficiencyScore = res.data.summary.efficiencyScore;
            const optimalDays = sim.filter(d => d.status === "Optimal").length;

            let earnings = 0;
            if (efficiencyScore >= 90) earnings = 50;
            else if (efficiencyScore >= 60) earnings = 10;
            else earnings = -30;

            setStats(prev => ({
                ...prev,
                coins: Math.max(0, prev.coins + earnings),
                xp: prev.xp + (optimalDays * 10),
                level: prev.xp > 150 ? 'Village Hero' : prev.xp > 50 ? 'Smart Farmer' : 'Novice',
                efficiency: efficiencyScore
            }));

            setData(sim);
            setGameState('RESULTS');
            setDayIndex(0);
        } catch (err) {
            alert("Backend Offline! Check your terminal running server.js.");
        }
    };

    const resetStrategy = () => {
        setGameState('ORACLE');
        setDayIndex(0);
    };

    return (
        <div className="min-h-full bg-slate-900 rounded-3xl p-6 md:p-10 font-sans text-white shadow-inner">

            {/* HUD (Heads Up Display) */}
            <div className="flex justify-around bg-white/10 backdrop-blur-md p-4 rounded-2xl mb-8 border border-white/10 font-bold shadow-lg">
                <div className="text-lg md:text-xl">💰 {stats.coins} AquaCoins</div>
                <div className="text-lg md:text-xl">⭐ {stats.xp} XP</div>
                <div className="text-lg md:text-xl text-green-400">🏆 {stats.level}</div>
            </div>

            {/* Main Game Card */}
            <div className="max-w-3xl mx-auto bg-white text-gray-800 rounded-3xl p-6 md:p-10 shadow-2xl text-center">
                {gameState === 'ORACLE' ? (
                    <div className="animate-fade-in">

                        {/* Weather Widget */}
                        <div className="bg-slate-50 p-6 rounded-2xl mb-8 border-2 border-slate-200 shadow-sm">
                            <h2 className="text-2xl font-black text-slate-900 mb-2">🛰️ 5-Day Satellite Forecast</h2>
                            <p className="text-slate-500 text-sm mb-6">Analyze the incoming climate data to predict your exact water needs.</p>

                            {weatherError ? (
                                <div className="p-5 text-red-600 font-bold border-2 border-dashed border-red-500 rounded-xl bg-red-50">
                                    {weatherError}
                                </div>
                            ) : weather.length > 0 ? (
                                <div className="flex justify-between overflow-x-auto pb-4 gap-3">
                                    {weather.map((day, i) => (
                                        <div key={i} className="bg-white p-4 rounded-xl shadow-sm min-w-[100px] border border-slate-100 flex-shrink-0">
                                            <div className="font-black text-slate-900 mb-2 text-sm">{day.date}</div>
                                            <div className="text-amber-500 font-bold mb-1 text-sm">🌡️ {day.temp}°C</div>
                                            <div className={`font-bold my-1 text-xs ${day.pop > 40 ? 'text-blue-500' : 'text-slate-400'}`}>
                                                🌧️ {day.pop}% Chance
                                            </div>
                                            <div className="text-slate-500 text-xs mt-2">{day.rain > 0 ? `${day.rain}mm rain` : 'Clear'}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-5 text-slate-500 animate-pulse font-semibold">Fetching real-time satellite data...</div>
                            )}
                        </div>

                        {/* Input Controls */}
                        <div className="mb-8 p-6 bg-green-50 rounded-2xl border border-green-200 text-left">
                            <label className="block font-bold text-green-800 text-lg mb-2">1. Select Your Crop:</label>
                            <select
                                value={crop}
                                onChange={(e) => setCrop(e.target.value)}
                                className="w-full p-4 rounded-xl border-2 border-green-300 text-lg mb-6 bg-white text-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 font-bold cursor-pointer"
                            >
                                <option value="wheat">Wheat (Low Water Needs)</option>
                                <option value="rice">Rice (High Water Needs)</option>
                                <option value="sugarcane">Sugarcane (Intense Water)</option>
                            </select>

                            <label className="block font-bold text-green-800 text-lg mb-4">2. Schedule Irrigation (mm):</label>
                            <input
                                type="range" min="0" max="50" value={guess}
                                onChange={(e) => setGuess(e.target.value)}
                                className="w-full h-3 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                            />

                            <div className="text-center mt-6">
                                <div className="text-6xl font-black text-green-600 leading-none">{guess} mm</div>
                                <p className="text-green-700 font-bold mt-2">= {(guess * 10000).toLocaleString()} Liters per Hectare</p>
                            </div>
                        </div>

                        <button
                            onClick={runAdvancedSimulation}
                            className="w-full py-5 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-2xl text-xl font-black shadow-lg shadow-green-200 hover:scale-[1.02] transition-transform"
                        >
                            RUN SIMULATION
                        </button>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        {/* Results View */}
                        <div className={`p-8 rounded-3xl mb-8 border-2 transition-colors duration-300 ${data[dayIndex].status === 'Optimal' ? 'bg-green-100 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <h2 className={`text-2xl font-black mb-4 ${data[dayIndex].status === 'Optimal' ? 'text-green-800' : 'text-red-800'}`}>
                                {data[dayIndex].status === 'Optimal' ? '🌿 GOLDEN HARVEST' : '💸 MONEY PIT'}
                            </h2>

                            <div className="text-8xl font-black my-6 drop-shadow-sm text-slate-800">{data[dayIndex].moisture}%</div>
                            <p className="font-bold text-slate-600 text-xl my-2">
                                STATUS: {data[dayIndex].status.toUpperCase()}
                            </p>

                            <div className="mt-4 text-slate-500 text-sm font-medium">
                                <strong>{data[dayIndex].date}</strong> | Temp: {data[dayIndex].temp}°C | Rain: {data[dayIndex].rain}mm
                            </div>

                            {data[dayIndex].wastePenalty > 0 && (
                                <p className="text-red-600 font-bold mt-4 bg-red-100 py-2 rounded-lg">
                                    ⚠️ Economic Leakage: {data[dayIndex].wastePenalty} units wasted!
                                </p>
                            )}
                        </div>

                        <input
                            type="range" min="0" max={data.length - 1} value={dayIndex}
                            onChange={(e) => setDayIndex(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
                        />
                        <p className="text-slate-400 text-sm mt-2 font-medium">Slide to review your strategy's impact</p>

                        <div className="mt-10 p-6 bg-slate-50 rounded-2xl border-2 border-slate-200">
                            <h3 className="text-slate-700 font-bold mb-2">Post-Simulation Report</h3>
                            <p className={`text-3xl font-black my-3 ${stats.efficiency >= 80 ? 'text-emerald-500' : stats.efficiency >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                                Engine Efficiency: {stats.efficiency}%
                            </p>
                            <p className="text-sm text-slate-500 mb-6 font-medium">
                                {stats.efficiency >= 80 ? "Excellent strategy! You maximized yield and saved water." : "Poor planning. You lost valuable resources."}
                            </p>
                            <button
                                onClick={resetStrategy}
                                className="px-8 py-3 rounded-xl border-2 border-emerald-600 text-emerald-600 font-bold hover:bg-emerald-50 transition-colors"
                            >
                                PLAN NEXT WEEK
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Gamification;
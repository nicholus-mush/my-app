import React from 'react';
import useSimulation from '../hooks/useSimulation';
import { weatherSimulator } from '../simulators/weatherSimulator';

const WeatherDashboard = () => {
  const { 
    data, 
    isConnected, 
    isRunning, 
    startSimulation, 
    stopSimulation 
  } = useSimulation(weatherSimulator, false);

  const getConditionIcon = (condition) => {
    switch (condition) {
      case 'clear': return '☀️';
      case 'partly_cloudy': return '⛅';
      case 'cloudy': return '☁️';
      case 'rain': return '🌧️';
      case 'storm': return '⛈️';
      case 'fog': return '🌫️';
      default: return '🌈';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'clear': return 'text-yellow-400';
      case 'partly_cloudy': return 'text-blue-300';
      case 'cloudy': return 'text-gray-400';
      case 'rain': return 'text-blue-400';
      case 'storm': return 'text-purple-400';
      case 'fog': return 'text-gray-300';
      default: return 'text-gray-400';
    }
  };

  const getTemperatureColor = (temp) => {
    if (temp < 0) return 'text-blue-300';
    if (temp < 10) return 'text-blue-400';
    if (temp < 20) return 'text-green-400';
    if (temp < 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getWindColor = (speed) => {
    if (speed < 10) return 'text-green-400';
    if (speed < 25) return 'text-yellow-400';
    if (speed < 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getVisibilityColor = (visibility) => {
    if (visibility >= 10) return 'text-green-400';
    if (visibility >= 5) return 'text-yellow-400';
    if (visibility >= 2) return 'text-orange-400';
    return 'text-red-400';
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="text-6xl mb-4">🌤️</div>
            <h2 className="text-2xl font-bold mb-4">Weather Monitoring System</h2>
            <button
              onClick={startSimulation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-mono transition-colors"
            >
              START SIMULATION
            </button>
          </div>
        </div>
      </div>
    );
  }

  const impacts = [
    { condition: data.windSpeed > 50, message: '🚫 High winds - Crane operations suspended', color: 'text-red-400' },
    { condition: data.conditions === 'storm', message: '⚡ Storm - All outdoor operations affected', color: 'text-red-400' },
    { condition: data.visibility < 2, message: '👁️ Low visibility - Reduced operational speed', color: 'text-orange-400' },
    { condition: data.temperature > 35, message: '🔥 High temperature - Equipment monitoring required', color: 'text-orange-400' },
    { condition: data.conditions === 'rain', message: '🌧️ Rain - Wet operations protocols active', color: 'text-yellow-400' },
    { condition: data.windSpeed > 25 && data.windSpeed <= 50, message: '💨 Moderate winds - Reduced crane capacity', color: 'text-yellow-400' },
  ].filter(impact => impact.condition);

  if (impacts.length === 0) {
    impacts.push({ message: '✅ Normal operations - No weather impacts', color: 'text-green-400' });
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-mono font-bold text-cyan-400">WEATHER MONITORING SYSTEM</h1>
            <div className="flex gap-4">
              <button
                onClick={startSimulation}
                disabled={isRunning}
                className={`px-4 py-2 rounded font-mono text-sm transition-colors ${
                  isRunning 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                START
              </button>
              <button
                onClick={stopSimulation}
                disabled={!isRunning}
                className={`px-4 py-2 rounded font-mono text-sm transition-colors ${
                  !isRunning 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                STOP
              </button>
            </div>
          </div>

          {/* Weather Overview */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <div className="text-gray-400 font-mono text-sm">CONDITION</div>
              <div className="text-2xl font-mono flex items-center gap-2">
                <span>{getConditionIcon(data.conditions)}</span>
                <span className={getConditionColor(data.conditions)}>
                  {data.conditions.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <div className="text-gray-400 font-mono text-sm">TEMPERATURE</div>
              <div className={`text-2xl font-mono ${getTemperatureColor(data.temperature)}`}>
                {Math.round(data.temperature)}°C
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <div className="text-gray-400 font-mono text-sm">WIND SPEED</div>
              <div className={`text-2xl font-mono ${getWindColor(data.windSpeed)}`}>
                {Math.round(data.windSpeed)} km/h
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <div className="text-gray-400 font-mono text-sm">VISIBILITY</div>
              <div className={`text-2xl font-mono ${getVisibilityColor(data.visibility)}`}>
                {Math.round(data.visibility)} km
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Weather Data */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Weather Parameters */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 bg-gray-700 border-b border-gray-600">
              <h2 className="text-xl font-mono font-bold">WEATHER PARAMETERS</h2>
            </div>
            <div className="p-6">
              <table className="w-full">
                <tbody className="divide-y divide-gray-700">
                  <tr>
                    <td className="px-4 py-3 font-mono text-gray-400">HUMIDITY</td>
                    <td className="px-4 py-3 font-mono text-right text-blue-400">{Math.round(data.humidity)}%</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-gray-400">WIND DIRECTION</td>
                    <td className="px-4 py-3 font-mono text-right text-green-400">{data.windDirection}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-gray-400">PRESSURE</td>
                    <td className="px-4 py-3 font-mono text-right text-purple-400">{Math.round(data.pressure)} hPa</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-gray-400">FEELS LIKE</td>
                    <td className="px-4 py-3 font-mono text-right text-yellow-400">
                      {Math.round(data.temperature + (data.humidity / 100) * 2)}°C
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Operational Impacts */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 bg-gray-700 border-b border-gray-600">
              <h2 className="text-xl font-mono font-bold">OPERATIONAL IMPACTS</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {impacts.map((impact, index) => (
                  <div key={index} className={`font-mono text-sm ${impact.color}`}>
                    {impact.message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Wind & Pressure Trends */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="font-mono text-lg font-bold mb-4 text-yellow-400">WIND ANALYSIS</h3>
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-sm">
                <span className="text-gray-400">Current Speed:</span>
                <span className={getWindColor(data.windSpeed)}>{Math.round(data.windSpeed)} km/h</span>
              </div>
              <div className="flex justify-between font-mono text-sm">
                <span className="text-gray-400">Direction:</span>
                <span className="text-green-400">{data.windDirection}</span>
              </div>
              <div className="flex justify-between font-mono text-sm">
                <span className="text-gray-400">Crane Operations:</span>
                <span className={data.windSpeed > 50 ? 'text-red-400' : 'text-green-400'}>
                  {data.windSpeed > 50 ? 'SUSPENDED' : 'NORMAL'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="font-mono text-lg font-bold mb-4 text-purple-400">PRESSURE TREND</h3>
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-sm">
                <span className="text-gray-400">Current Pressure:</span>
                <span className="text-purple-400">{Math.round(data.pressure)} hPa</span>
              </div>
              <div className="flex justify-between font-mono text-sm">
                <span className="text-gray-400">Trend:</span>
                <span className={data.pressure < 1000 ? 'text-red-400' : data.pressure < 1013 ? 'text-yellow-400' : 'text-green-400'}>
                  {data.pressure < 1000 ? 'LOW' : data.pressure < 1013 ? 'STABLE' : 'HIGH'}
                </span>
              </div>
              <div className="flex justify-between font-mono text-sm">
                <span className="text-gray-400">Forecast:</span>
                <span className={data.pressure < 1000 ? 'text-red-400' : 'text-green-400'}>
                  {data.pressure < 1000 ? 'STORM LIKELY' : 'STABLE WEATHER'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-gray-500 font-mono text-sm">
          LAST UPDATE: {new Date(data.timestamp).toLocaleTimeString()} | 
          PORT STATUS: {impacts[0].color.includes('red') ? 'CRITICAL' : impacts[0].color.includes('orange') ? 'DEGRADED' : 'NORMAL'}
        </div>
      </div>
    </div>
  );
};

export default WeatherDashboard;
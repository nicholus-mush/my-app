import React, { useState, useEffect } from 'react';
import { vesselSimulator } from '../simulators/vesselSimulator';
import { berthSimulator } from '../simulators/berthSimulator';
import { craneSimulator } from '../simulators/craneSimulator';
import { truckSimulator } from '../simulators/truckSimulator';
import { weatherSimulator } from '../simulators/weatherSimulator';

const AnalyticsDashboard = ({ onBack }) => {
  const [vesselData, setVesselData] = useState(null);
  const [berthData, setBerthData] = useState(null);
  const [craneData, setCraneData] = useState(null);
  const [truckData, setTruckData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('realtime');

  useEffect(() => {
    const vesselUnsub = vesselSimulator.onData(setVesselData);
    const berthUnsub = berthSimulator.onData(setBerthData);
    const craneUnsub = craneSimulator.onData(setCraneData);
    const truckUnsub = truckSimulator.onData(setTruckData);
    const weatherUnsub = weatherSimulator.onData(setWeatherData);

    return () => {
      vesselUnsub();
      berthUnsub();
      craneUnsub();
      truckUnsub();
      weatherUnsub();
    };
  }, []);

  // Truck-specific congestion analysis
  const getTruckCongestionMetrics = () => {
    if (!truckData) return null;

    const waitingTrucks = truckData.trucks.filter(t => t.status === 'waiting').length;
    const loadingTrucks = truckData.trucks.filter(t => t.status === 'loading').length;
    const unloadingTrucks = truckData.trucks.filter(t => t.status === 'unloading').length;
    const totalActive = truckData.activeTrucks;
    
    const gateQueue = truckData.trucks.filter(t => 
      t.currentLocation === 'Gate' && (t.status === 'waiting' || t.status === 'loading')
    ).length;

    const yardQueue = truckData.trucks.filter(t => 
      t.currentLocation === 'Yard' && (t.status === 'waiting' || t.status === 'unloading')
    ).length;

    const congestionLevel = (waitingTrucks / truckData.totalTrucks) * 100;
    
    return {
      waitingTrucks,
      loadingTrucks,
      unloadingTrucks,
      totalActive,
      gateQueue,
      yardQueue,
      congestionLevel,
      congestionStatus: congestionLevel > 30 ? 'HIGH' : congestionLevel > 15 ? 'MEDIUM' : 'LOW'
    };
  };

  // Crane productivity analysis
  const getCraneProductivityMetrics = () => {
    if (!craneData) return null;

    const operationalCranes = craneData.operationalCranes;
    const totalMoves = craneData.totalMoves;
    const avgUtilization = craneData.averageUtilization;
    
    const movesPerCrane = operationalCranes > 0 ? Math.round(totalMoves / operationalCranes) : 0;
    
    const productivityScore = (avgUtilization / 100) * (movesPerCrane / 30) * 100;
    
    return {
      operationalCranes,
      totalMoves,
      avgUtilization,
      movesPerCrane,
      productivityScore,
      productivityStatus: productivityScore > 80 ? 'HIGH' : productivityScore > 60 ? 'MEDIUM' : 'LOW'
    };
  };

  // Berth utilization analysis
  const getBerthUtilizationMetrics = () => {
    if (!berthData) return null;

    const occupiedRate = (berthData.occupiedBerths / berthData.totalBerths) * 100;
    const availableRate = (berthData.availableBerths / berthData.totalBerths) * 100;
    
    const efficiencyScore = occupiedRate * (berthData.overallUtilization / 100);
    
    return {
      occupiedRate,
      availableRate,
      efficiencyScore,
      efficiencyStatus: efficiencyScore > 80 ? 'HIGH' : efficiencyScore > 60 ? 'MEDIUM' : 'LOW'
    };
  };

  // Weather impact analysis
  const getWeatherImpactMetrics = () => {
    if (!weatherData) return null;

    const impacts = [];
    let operationalImpact = 'NONE';
    let impactScore = 100;

    // Wind impact
    if (weatherData.windSpeed > 50) {
      impacts.push('🚫 Crane operations suspended due to high winds');
      operationalImpact = 'SEVERE';
      impactScore -= 40;
    } else if (weatherData.windSpeed > 25) {
      impacts.push('💨 Reduced crane capacity due to moderate winds');
      operationalImpact = 'MODERATE';
      impactScore -= 20;
    }

    // Visibility impact
    if (weatherData.visibility < 2) {
      impacts.push('👁️ Operations slowed due to low visibility');
      operationalImpact = operationalImpact === 'NONE' ? 'MODERATE' : operationalImpact;
      impactScore -= 15;
    } else if (weatherData.visibility < 5) {
      impacts.push('⚠️ Caution advised due to reduced visibility');
      impactScore -= 10;
    }

    // Temperature impact
    if (weatherData.temperature > 35) {
      impacts.push('🔥 Equipment monitoring required due to high temperature');
      impactScore -= 10;
    } else if (weatherData.temperature < 0) {
      impacts.push('❄️ Cold weather protocols activated');
      impactScore -= 5;
    }

    // Rain/Storm impact
    if (weatherData.conditions === 'storm') {
      impacts.push('⚡ Storm conditions - outdoor operations affected');
      operationalImpact = 'SEVERE';
      impactScore -= 30;
    } else if (weatherData.conditions === 'rain') {
      impacts.push('🌧️ Wet operations protocols active');
      impactScore -= 10;
    }

    if (impacts.length === 0) {
      impacts.push('✅ Optimal weather conditions for operations');
    }

    return {
      impacts,
      operationalImpact,
      impactScore: Math.max(0, impactScore),
      windSpeed: weatherData.windSpeed,
      visibility: weatherData.visibility,
      temperature: weatherData.temperature,
      conditions: weatherData.conditions
    };
  };

  // Overall port efficiency score
  const getOverallEfficiency = () => {
    const truckMetrics = getTruckCongestionMetrics();
    const craneMetrics = getCraneProductivityMetrics();
    const berthMetrics = getBerthUtilizationMetrics();
    const weatherMetrics = getWeatherImpactMetrics();

    if (!truckMetrics || !craneMetrics || !berthMetrics || !weatherMetrics) return null;

    const truckScore = 100 - truckMetrics.congestionLevel;
    const craneScore = craneMetrics.productivityScore;
    const berthScore = berthMetrics.efficiencyScore;
    const weatherScore = weatherMetrics.impactScore;

    const overallScore = (truckScore + craneScore + berthScore + weatherScore) / 4;

    return {
      overallScore: Math.round(overallScore),
      status: overallScore > 80 ? 'EXCELLENT' : overallScore > 60 ? 'GOOD' : overallScore > 40 ? 'FAIR' : 'POOR',
      components: { truckScore, craneScore, berthScore, weatherScore }
    };
  };

  const truckMetrics = getTruckCongestionMetrics();
  const craneMetrics = getCraneProductivityMetrics();
  const berthMetrics = getBerthUtilizationMetrics();
  const weatherMetrics = getWeatherImpactMetrics();
  const overallMetrics = getOverallEfficiency();

  if (!vesselData || !berthData || !craneData || !truckData || !weatherData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <div className="font-mono text-gray-400">Loading real-time analytics...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={onBack}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-mono text-sm transition-colors flex items-center gap-2"
          >
            ← CONTROL CENTER
          </button>
          <h1 className="text-3xl font-mono font-bold text-purple-400">REAL-TIME PORT ANALYTICS</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTimeRange('realtime')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                selectedTimeRange === 'realtime' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              LIVE
            </button>
            <button
              onClick={() => setSelectedTimeRange('hourly')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                selectedTimeRange === 'hourly' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              1H
            </button>
            <button
              onClick={() => setSelectedTimeRange('daily')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                selectedTimeRange === 'daily' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              24H
            </button>
          </div>
        </div>

        {/* Overall Efficiency Score */}
        {overallMetrics && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-mono font-bold">PORT EFFICIENCY SCORE</h2>
              <div className={`text-4xl font-mono font-bold ${
                overallMetrics.overallScore >= 80 ? 'text-green-400' :
                overallMetrics.overallScore >= 60 ? 'text-yellow-400' :
                overallMetrics.overallScore >= 40 ? 'text-orange-400' : 'text-red-400'
              }`}>
                {overallMetrics.overallScore}%
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-400 font-mono">TRUCKS</div>
                <div className="text-lg font-mono text-green-400">{Math.round(overallMetrics.components.truckScore)}%</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400 font-mono">CRANES</div>
                <div className="text-lg font-mono text-yellow-400">{Math.round(overallMetrics.components.craneScore)}%</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400 font-mono">BERTHS</div>
                <div className="text-lg font-mono text-blue-400">{Math.round(overallMetrics.components.berthScore)}%</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-400 font-mono">WEATHER</div>
                <div className="text-lg font-mono text-cyan-400">{Math.round(overallMetrics.components.weatherScore)}%</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Truck Congestion Analysis */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-mono font-bold mb-4 text-orange-400">🚛 TRUCK CONGESTION ANALYSIS</h3>
            {truckMetrics && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-gray-400">Congestion Level:</span>
                  <span className={`font-mono font-bold ${
                    truckMetrics.congestionStatus === 'HIGH' ? 'text-red-400' :
                    truckMetrics.congestionStatus === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {truckMetrics.congestionStatus} ({Math.round(truckMetrics.congestionLevel)}%)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl text-orange-400">{truckMetrics.gateQueue}</div>
                    <div className="text-xs text-gray-400">Gate Queue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl text-yellow-400">{truckMetrics.yardQueue}</div>
                    <div className="text-xs text-gray-400">Yard Queue</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Waiting:</span>
                    <span className="text-red-400">{truckMetrics.waitingTrucks}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Loading:</span>
                    <span className="text-blue-400">{truckMetrics.loadingTrucks}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Unloading:</span>
                    <span className="text-purple-400">{truckMetrics.unloadingTrucks}</span>
                  </div>
                </div>
                {truckMetrics.congestionLevel > 20 && (
                  <div className="bg-red-900 border border-red-700 p-3 rounded font-mono text-sm text-red-200">
                    ⚠️ High congestion detected. Consider optimizing truck dispatch.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Crane Productivity Analysis */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-mono font-bold mb-4 text-yellow-400">🏗️ CRANE PRODUCTIVITY</h3>
            {craneMetrics && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-gray-400">Productivity:</span>
                  <span className={`font-mono font-bold ${
                    craneMetrics.productivityStatus === 'HIGH' ? 'text-green-400' :
                    craneMetrics.productivityStatus === 'MEDIUM' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {craneMetrics.productivityStatus}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl text-green-400">{craneMetrics.operationalCranes}</div>
                    <div className="text-xs text-gray-400">Operational</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl text-blue-400">{craneMetrics.movesPerCrane}</div>
                    <div className="text-xs text-gray-400">Moves/Crane</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Moves:</span>
                    <span className="text-purple-400">{craneMetrics.totalMoves}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Avg Utilization:</span>
                    <span className="text-cyan-400">{craneMetrics.avgUtilization}%</span>
                  </div>
                </div>
                {craneMetrics.productivityStatus === 'LOW' && (
                  <div className="bg-yellow-900 border border-yellow-700 p-3 rounded font-mono text-sm text-yellow-200">
                    ⚠️ Low crane productivity. Check equipment and operator efficiency.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Weather Impact Analysis */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-mono font-bold mb-4 text-cyan-400">🌤️ WEATHER IMPACT ANALYSIS</h3>
            {weatherMetrics && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-gray-400">Operational Impact:</span>
                  <span className={`font-mono font-bold ${
                    weatherMetrics.operationalImpact === 'SEVERE' ? 'text-red-400' :
                    weatherMetrics.operationalImpact === 'MODERATE' ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {weatherMetrics.operationalImpact}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`text-xl ${
                      weatherMetrics.windSpeed > 25 ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {Math.round(weatherMetrics.windSpeed)} km/h
                    </div>
                    <div className="text-xs text-gray-400">Wind</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xl ${
                      weatherMetrics.visibility < 5 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {Math.round(weatherMetrics.visibility)} km
                    </div>
                    <div className="text-xs text-gray-400">Visibility</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xl ${
                      weatherMetrics.temperature > 35 || weatherMetrics.temperature < 0 ? 'text-orange-400' : 'text-green-400'
                    }`}>
                      {Math.round(weatherMetrics.temperature)}°C
                    </div>
                    <div className="text-xs text-gray-400">Temp</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {weatherMetrics.impacts.map((impact, index) => (
                    <div key={index} className="text-sm font-mono">
                      {impact}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Berth Utilization Analysis */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-mono font-bold mb-4 text-blue-400">⚓ BERTH UTILIZATION</h3>
            {berthMetrics && berthData && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-gray-400">Efficiency:</span>
                  <span className={`font-mono font-bold ${
                    berthMetrics.efficiencyStatus === 'HIGH' ? 'text-green-400' :
                    berthMetrics.efficiencyStatus === 'MEDIUM' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {berthMetrics.efficiencyStatus}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl text-green-400">{berthData.occupiedBerths}</div>
                    <div className="text-xs text-gray-400">Occupied</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl text-blue-400">{berthData.availableBerths}</div>
                    <div className="text-xs text-gray-400">Available</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Berths:</span>
                    <span className="text-purple-400">{berthData.totalBerths}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Utilization Rate:</span>
                    <span className="text-cyan-400">{berthData.overallUtilization}%</span>
                  </div>
                </div>
                {berthMetrics.efficiencyStatus === 'LOW' && (
                  <div className="bg-blue-900 border border-blue-700 p-3 rounded font-mono text-sm text-blue-200">
                    ⚠️ Low berth efficiency. Consider optimizing vessel scheduling.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-mono font-bold mb-4 text-green-400">💡 INTELLIGENT RECOMMENDATIONS</h3>
          <div className="space-y-3 font-mono text-sm">
            {truckMetrics?.congestionLevel > 25 && (
              <div className="text-yellow-400">• Dispatch additional trucks to reduce gate queue</div>
            )}
            {craneMetrics?.productivityStatus === 'LOW' && (
              <div className="text-orange-400">• Schedule crane maintenance and operator training</div>
            )}
            {weatherMetrics?.operationalImpact === 'SEVERE' && (
              <div className="text-red-400">• Implement severe weather protocols immediately</div>
            )}
            {berthMetrics?.efficiencyScore < 50 && (
              <div className="text-blue-400">• Optimize vessel arrival schedules for better berth utilization</div>
            )}
            {overallMetrics?.overallScore > 80 && (
              <div className="text-green-400">• Port operations running at optimal efficiency</div>
            )}
            {(!truckMetrics || truckMetrics.congestionLevel <= 15) && (
              <div className="text-green-400">• Truck flow is optimal, maintain current dispatch rates</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-gray-500 font-mono text-sm">
          LAST UPDATED: {new Date().toLocaleTimeString()} | REAL-TIME ANALYTICS ACTIVE
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
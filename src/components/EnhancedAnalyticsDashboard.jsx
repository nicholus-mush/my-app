import React, { useState, useEffect } from 'react';
import { vesselSimulator } from '../simulators/vesselSimulator';
import { berthSimulator } from '../simulators/berthSimulator';
import { craneSimulator } from '../simulators/craneSimulator';
import { truckSimulator } from '../simulators/truckSimulator';
import { weatherSimulator } from '../simulators/weatherSimulator';
import LineChart from './charts/LineChart';
import BarChart from './charts/BarChart';
import DoughnutChart from './charts/DoughnutChart';
import GaugeChart from './charts/GaugeChart';

const EnhancedAnalyticsDashboard = ({ onBack }) => {
  const [vesselData, setVesselData] = useState(null);
  const [berthData, setBerthData] = useState(null);
  const [craneData, setCraneData] = useState(null);
  const [truckData, setTruckData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [historicalData, setHistoricalData] = useState({
    truckCongestion: [],
    craneProductivity: [],
    berthUtilization: [],
    timestamps: []
  });

  // Collect historical data
  useEffect(() => {
    const interval = setInterval(() => {
      if (truckData && craneData && berthData) {
        setHistoricalData(prev => ({
          truckCongestion: [...prev.truckCongestion.slice(-29), getTruckCongestionMetrics()?.congestionLevel || 0],
          craneProductivity: [...prev.craneProductivity.slice(-29), getCraneProductivityMetrics()?.productivityScore || 0],
          berthUtilization: [...prev.berthUtilization.slice(-29), berthData.overallUtilization || 0],
          timestamps: [...prev.timestamps.slice(-29), new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})]
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [truckData, craneData, berthData]);

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
      gateQueue,
      yardQueue,
      congestionLevel,
      congestionStatus: congestionLevel > 30 ? 'HIGH' : congestionLevel > 15 ? 'MEDIUM' : 'LOW',
      truckDistribution: [waitingTrucks, loadingTrucks, unloadingTrucks, truckData.trucks.filter(t => t.status === 'traveling').length]
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
      productivityStatus: productivityScore > 80 ? 'HIGH' : productivityScore > 60 ? 'MEDIUM' : 'LOW',
      craneStatus: [
        craneData.operationalCranes,
        craneData.idleCranes,
        craneData.maintenanceCranes
      ]
    };
  };

  // Weather impact analysis
  const getWeatherImpactMetrics = () => {
    if (!weatherData) return null;

    let impactScore = 100;

    if (weatherData.windSpeed > 50) impactScore -= 40;
    else if (weatherData.windSpeed > 25) impactScore -= 20;

    if (weatherData.visibility < 2) impactScore -= 15;
    else if (weatherData.visibility < 5) impactScore -= 10;

    if (weatherData.temperature > 35 || weatherData.temperature < 0) impactScore -= 10;
    if (weatherData.conditions === 'storm') impactScore -= 30;
    else if (weatherData.conditions === 'rain') impactScore -= 10;

    return {
      impactScore: Math.max(0, impactScore),
      windSpeed: weatherData.windSpeed,
      visibility: weatherData.visibility,
      temperature: weatherData.temperature
    };
  };

  const truckMetrics = getTruckCongestionMetrics();
  const craneMetrics = getCraneProductivityMetrics();
  const weatherMetrics = getWeatherImpactMetrics();

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
          <h1 className="text-3xl font-mono font-bold text-purple-400">VISUAL PORT ANALYTICS</h1>
          <div className="text-sm font-mono text-gray-400">
            {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Overall Performance Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="h-48">
              <GaugeChart 
                value={truckMetrics?.congestionLevel ? 100 - truckMetrics.congestionLevel : 0} 
                title="TRUCK FLOW" 
                color={truckMetrics?.congestionStatus === 'HIGH' ? '#EF4444' : truckMetrics?.congestionStatus === 'MEDIUM' ? '#F59E0B' : '#10B981'}
              />
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="h-48">
              <GaugeChart 
                value={craneMetrics?.productivityScore || 0} 
                title="CRANE PRODUCTIVITY" 
                color={craneMetrics?.productivityStatus === 'HIGH' ? '#10B981' : craneMetrics?.productivityStatus === 'MEDIUM' ? '#F59E0B' : '#EF4444'}
              />
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="h-48">
              <GaugeChart 
                value={berthData.overallUtilization} 
                title="BERTH UTILIZATION" 
                color={berthData.overallUtilization > 80 ? '#10B981' : berthData.overallUtilization > 60 ? '#F59E0B' : '#EF4444'}
              />
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="h-48">
              <GaugeChart 
                value={weatherMetrics?.impactScore || 100} 
                title="WEATHER IMPACT" 
                color={weatherMetrics?.impactScore > 80 ? '#10B981' : weatherMetrics?.impactScore > 60 ? '#F59E0B' : '#EF4444'}
              />
            </div>
          </div>
        </div>

        {/* Real-time Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-mono font-bold mb-4 text-orange-400">🚛 TRUCK CONGESTION TREND</h3>
            <div className="h-64">
              <LineChart 
                data={historicalData.truckCongestion}
                labels={historicalData.timestamps}
                title="Congestion Level Over Time"
                color="#F59E0B"
              />
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-mono font-bold mb-4 text-yellow-400">🏗️ CRANE PRODUCTIVITY TREND</h3>
            <div className="h-64">
              <LineChart 
                data={historicalData.craneProductivity}
                labels={historicalData.timestamps}
                title="Productivity Score Over Time"
                color="#EAB308"
              />
            </div>
          </div>
        </div>

        {/* Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Truck Status Distribution */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-mono font-bold mb-4 text-green-400">🚛 TRUCK STATUS DISTRIBUTION</h3>
            <div className="h-64">
              <DoughnutChart 
                data={truckMetrics?.truckDistribution || []}
                labels={['Waiting', 'Loading', 'Unloading', 'Traveling']}
                title="Truck Status"
                colors={['#EF4444', '#3B82F6', '#8B5CF6', '#10B981']}
              />
            </div>
          </div>

          {/* Crane Status Distribution */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-mono font-bold mb-4 text-blue-400">🏗️ CRANE STATUS DISTRIBUTION</h3>
            <div className="h-64">
              <DoughnutChart 
                data={craneMetrics?.craneStatus || []}
                labels={['Operational', 'Idle', 'Maintenance']}
                title="Crane Status"
                colors={['#10B981', '#F59E0B', '#EF4444']}
              />
            </div>
          </div>

          {/* Queue Analysis */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-mono font-bold mb-4 text-purple-400">📊 QUEUE ANALYSIS</h3>
            <div className="h-64">
              <BarChart 
                data={[truckMetrics?.gateQueue || 0, truckMetrics?.yardQueue || 0]}
                labels={['Gate Queue', 'Yard Queue']}
                title="Current Queues"
                colors={['#8B5CF6', '#EC4899']}
              />
            </div>
          </div>
        </div>

        {/* Weather Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-mono font-bold mb-4 text-cyan-400">🌤️ WEATHER METRICS</h3>
            <div className="h-64">
              <BarChart 
                data={[
                  weatherMetrics?.windSpeed || 0,
                  weatherMetrics?.visibility || 0,
                  weatherMetrics?.temperature || 0
                ]}
                labels={['Wind Speed (km/h)', 'Visibility (km)', 'Temperature (°C)']}
                title="Current Weather Conditions"
                colors={['#06B6D4', '#8B5CF6', '#EF4444']}
              />
            </div>
          </div>

          {/* Performance Comparison */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-mono font-bold mb-4 text-green-400">📈 PERFORMANCE COMPARISON</h3>
            <div className="h-64">
              <BarChart 
                data={[
                  truckMetrics ? 100 - truckMetrics.congestionLevel : 0,
                  craneMetrics?.productivityScore || 0,
                  berthData.overallUtilization,
                  weatherMetrics?.impactScore || 100
                ]}
                labels={['Truck Flow', 'Crane Prod', 'Berth Util', 'Weather']}
                title="System Performance Scores"
                colors={['#10B981', '#EAB308', '#3B82F6', '#06B6D4']}
              />
            </div>
          </div>
        </div>

        {/* Real-time Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
            <div className="text-2xl font-mono text-green-400">{truckData.activeTrucks}</div>
            <div className="text-xs text-gray-400 font-mono">ACTIVE TRUCKS</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
            <div className="text-2xl font-mono text-yellow-400">{craneData.operationalCranes}</div>
            <div className="text-xs text-gray-400 font-mono">OPERATIONAL CRANES</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
            <div className="text-2xl font-mono text-blue-400">{berthData.occupiedBerths}</div>
            <div className="text-xs text-gray-400 font-mono">OCCUPIED BERTHS</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
            <div className="text-2xl font-mono text-cyan-400">{Math.round(weatherData.temperature)}°C</div>
            <div className="text-xs text-gray-400 font-mono">CURRENT TEMP</div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 font-mono text-sm">
          LIVE VISUAL ANALYTICS | UPDATING EVERY 5 SECONDS | {historicalData.timestamps.length} DATA POINTS
        </div>
      </div>
    </div>
  );
};

export default EnhancedAnalyticsDashboard;
import React, { useState, useEffect } from 'react';
import { vesselSimulator } from '../simulators/vesselSimulator';
import { berthSimulator } from '../simulators/berthSimulator';
import { craneSimulator } from '../simulators/craneSimulator';
import { truckSimulator } from '../simulators/truckSimulator';
import { weatherSimulator } from '../simulators/weatherSimulator';
import { featureEngine, } from '../utils/featureEngine';
import LineChart from './charts/LineChart';
import BarChart from './charts/BarChart';

const PredictiveAnalytics = ({ onBack }) => {
  const [vesselData, setVesselData] = useState(null);
  const [berthData, setBerthData] = useState(null);
  const [craneData, setCraneData] = useState(null);
  const [truckData, setTruckData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [currentFeatures, setCurrentFeatures] = useState(null);
  const [futurePredictions, setFuturePredictions] = useState([]);
  const [featureTrends, setFeatureTrends] = useState(null);

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

  // Generate features when all data is available
  useEffect(() => {
    if (vesselData && berthData && craneData && truckData && weatherData) {
      const operationalData = {
        vessels: vesselData.vessels || [],
        berths: berthData.berths || [],
        cranes: craneData.cranes || [],
        trucks: truckData.trucks || [],
        weather: weatherData
      };

      const features = featureEngine.generateFeatures(operationalData);
      setCurrentFeatures(features);

      // Generate future predictions
      const vesselSchedule = featureEngine.generateVesselSchedule(vesselData.vessels || []);
      const predictions = featureEngine.predictFutureCongestion(vesselSchedule, features, 12);
      setFuturePredictions(predictions);

      // Get trends
      const trends = featureEngine.getFeatureTrends();
      setFeatureTrends(trends);
    }
  }, [vesselData, berthData, craneData, truckData, weatherData]);

  if (!currentFeatures) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <div className="font-mono text-gray-400">Calculating predictive features...</div>
          </div>
        </div>
      </div>
    );
  }

  const getCongestionColor = (level) => {
    switch (level) {
      case 'HIGH': return 'text-red-400';
      case 'MEDIUM': return 'text-yellow-400';
      case 'LOW': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getCongestionBgColor = (level) => {
    switch (level) {
      case 'HIGH': return 'bg-red-900';
      case 'MEDIUM': return 'bg-yellow-900';
      case 'LOW': return 'bg-green-900';
      default: return 'bg-gray-900';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={onBack}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-mono text-sm transition-colors flex items-center gap-2"
          >
            ← BACK TO ANALYTICS HUB
          </button>
          <h1 className="text-3xl font-mono font-bold text-blue-400">PREDICTIVE ANALYTICS</h1>
          <div className="text-sm font-mono text-gray-400">
            AI-Powered Forecasting
          </div>
        </div>

        {/* Current Feature Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-mono font-bold mb-4 text-green-400">📊 CURRENT OPERATIONAL FEATURES</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mono text-sm">Truck Congestion:</span>
                  <span className="font-mono font-bold text-orange-400">
                    {Math.round(currentFeatures.truck_congestion_index)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mono text-sm">Crane Utilization:</span>
                  <span className="font-mono font-bold text-yellow-400">
                    {Math.round(currentFeatures.crane_utilization_rate)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mono text-sm">Berth Occupancy:</span>
                  <span className="font-mono font-bold text-blue-400">
                    {Math.round(currentFeatures.berth_occupancy_rate)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mono text-sm">Weather Impact:</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {Math.round(currentFeatures.weather_impact_score)}%
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mono text-sm">Peak Hours:</span>
                  <span className="font-mono font-bold text-purple-400">
                    {currentFeatures.is_peak_hours ? 'YES' : 'NO'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mono text-sm">Weekend:</span>
                  <span className="font-mono font-bold text-purple-400">
                    {currentFeatures.is_weekend ? 'YES' : 'NO'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mono text-sm">Tide Condition:</span>
                  <span className="font-mono font-bold text-indigo-400">
                    {currentFeatures.tidal_conditions.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-mono text-sm">Predicted Wait:</span>
                  <span className="font-mono font-bold text-red-400">
                    {currentFeatures.total_waiting_time} min
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Trends */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-mono font-bold mb-4 text-yellow-400">📈 FEATURE TRENDS</h3>
            {featureTrends ? (
              <div className="space-y-3">
                {Object.entries(featureTrends).map(([metric, data]) => (
                  <div key={metric} className="flex justify-between items-center">
                    <span className="text-gray-400 font-mono text-sm capitalize">
                      {metric.replace(/_/g, ' ')}:
                    </span>
                    <div className="text-right">
                      <div className="font-mono font-bold">
                        {data.current.toFixed(1)}
                        <span className={`text-xs ml-2 ${
                          data.direction === 'increasing' ? 'text-red-400' : 
                          data.direction === 'decreasing' ? 'text-green-400' : 'text-gray-400'
                        }`}>
                          {data.direction === 'increasing' ? '↗' : 
                           data.direction === 'decreasing' ? '↘' : '→'}
                          {Math.abs(data.trend).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 font-mono">
                Collecting trend data...
              </div>
            )}
          </div>
        </div>

        {/* Future Congestion Predictions */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <h3 className="text-xl font-mono font-bold mb-4 text-orange-400">🔮 12-HOUR CONGESTION FORECAST</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {futurePredictions.map((prediction, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border text-center ${getCongestionBgColor(prediction.congestion_level)} border-gray-600`}
              >
                <div className="font-mono font-bold text-sm mb-1">{prediction.time}</div>
                <div className={`text-lg font-mono font-bold mb-1 ${getCongestionColor(prediction.congestion_level)}`}>
                  {prediction.predicted_congestion}%
                </div>
                <div className={`text-xs font-mono ${getCongestionColor(prediction.congestion_level)}`}>
                  {prediction.congestion_level}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {prediction.expected_vessels} vessels
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prediction Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-mono font-bold mb-4 text-green-400">📊 CONGESTION FORECAST TREND</h3>
            <div className="h-64">
              <LineChart 
                data={futurePredictions.map(p => p.predicted_congestion)}
                labels={futurePredictions.map(p => p.time)}
                title="Predicted Congestion Over Next 12 Hours"
                color="#F59E0B"
              />
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-mono font-bold mb-4 text-blue-400">🚢 EXPECTED VESSEL ARRIVALS</h3>
            <div className="h-64">
              <BarChart 
                data={futurePredictions.map(p => p.expected_vessels)}
                labels={futurePredictions.map(p => p.time)}
                title="Vessel Arrivals by Hour"
                colors={['#3B82F6']}
              />
            </div>
          </div>
        </div>

        {/* Feature Importance & Recommendations */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-mono font-bold mb-4 text-purple-400">💡 PREDICTIVE INSIGHTS</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-mono font-bold text-cyan-400 mb-3">Top Congestion Drivers:</h4>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Truck Congestion:</span>
                  <span className="text-orange-400">{Math.round(currentFeatures.truck_congestion_index)}% impact</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Berth Occupancy:</span>
                  <span className="text-blue-400">{Math.round(currentFeatures.berth_occupancy_rate)}% impact</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Peak Hour Effect:</span>
                  <span className="text-purple-400">{currentFeatures.is_peak_hours ? '+50%' : 'Normal'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Weather Impact:</span>
                  <span className="text-cyan-400">{Math.round(100 - currentFeatures.weather_impact_score)}% penalty</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-mono font-bold text-green-400 mb-3">Recommended Actions:</h4>
              <div className="space-y-2 font-mono text-sm">
                {futurePredictions.some(p => p.congestion_level === 'HIGH') && (
                  <div className="text-yellow-400">• Prepare for high congestion during peak hours</div>
                )}
                {currentFeatures.berth_occupancy_rate > 80 && (
                  <div className="text-orange-400">• Consider optimizing berth allocation</div>
                )}
                {currentFeatures.truck_congestion_index > 30 && (
                  <div className="text-red-400">• Dispatch additional trucks to clear queues</div>
                )}
                {currentFeatures.weather_impact_score < 70 && (
                  <div className="text-blue-400">• Implement weather contingency plans</div>
                )}
                {futurePredictions.filter(p => p.expected_vessels > 2).length > 0 && (
                  <div className="text-purple-400">• Schedule extra staff for vessel arrivals</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-gray-500 font-mono text-sm">
          PREDICTIVE ANALYTICS ENGINE | FEATURE-BASED FORECASTING | REAL-TIME UPDATES
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalytics;
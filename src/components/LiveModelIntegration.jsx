import React, { useState, useEffect } from 'react';
import { vesselSimulator } from '../simulators/vesselSimulator';
import { berthSimulator } from '../simulators/berthSimulator';
import { craneSimulator } from '../simulators/craneSimulator';
import { truckSimulator } from '../simulators/truckSimulator';
import { weatherSimulator } from '../simulators/weatherSimulator';
import { enhancedFeatureEngine } from '../utils/featureEngine';
import { mlApiService } from '../services/mlApiService';
import LineChart from './charts/LineChart';

const LiveModelIntegration = ({ onBack }) => {
  const [vesselData, setVesselData] = useState(null);
  const [berthData, setBerthData] = useState(null);
  const [craneData, setCraneData] = useState(null);
  const [truckData, setTruckData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [modelFeatures, setModelFeatures] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    const vesselUnsub = vesselSimulator.onData(setVesselData);
    const berthUnsub = berthSimulator.onData(setBerthData);
    const craneUnsub = craneSimulator.onData(setCraneData);
    const truckUnsub = truckSimulator.onData(setTruckData);
    const weatherUnsub = weatherSimulator.onData(setWeatherData);

    // Check API status on component mount
    checkApiStatus();

    return () => {
      vesselUnsub();
      berthUnsub();
      craneUnsub();
      truckUnsub();
      weatherUnsub();
    };
  }, []);

  // Auto-refresh predictions
  useEffect(() => {
    let interval;
    if (autoRefresh && modelFeatures) {
      interval = setInterval(() => {
        getPrediction();
      }, 30000); // Refresh every 30 seconds
    }
    return () => clearInterval(interval);
  }, [autoRefresh, modelFeatures]);

  // Generate features when data changes
  useEffect(() => {
    if (vesselData && berthData && craneData && truckData && weatherData) {
      const operationalData = {
        vessels: vesselData.vessels || [],
        berths: berthData.berths || [],
        cranes: craneData.cranes || [],
        trucks: truckData.trucks || [],
        weather: weatherData
      };

      const modelFeats = enhancedFeatureEngine.generateModelFeatures(operationalData);
      setModelFeatures(modelFeats);
    }
  }, [vesselData, berthData, craneData, truckData, weatherData]);

  const checkApiStatus = async () => {
    const status = await mlApiService.getAPIStatus();
    setApiStatus(status);
  };

  const getPrediction = async () => {
    if (!modelFeatures || isLoading) return;

    setIsLoading(true);
    try {
      const newPrediction = await mlApiService.getPrediction(modelFeatures);
      setPrediction(newPrediction);
      
      // Add to history
      setPredictionHistory(prev => [
        {
          ...newPrediction,
          timestamp: new Date().toLocaleTimeString(),
          features_hash: JSON.stringify(modelFeatures).length
        },
        ...prev.slice(0, 19) // Keep last 20 predictions
      ]);
    } catch (error) {
      console.error('Prediction error:', error);
      alert('Failed to get prediction. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyFeaturesForAPI = () => {
    if (modelFeatures) {
      const apiPayload = {
        features: modelFeatures,
        timestamp: new Date().toISOString(),
        metadata: {
          feature_count: Object.keys(modelFeatures).length,
          version: '1.0'
        }
      };
      
      navigator.clipboard.writeText(JSON.stringify(apiPayload, null, 2));
      alert('API payload copied to clipboard!');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'text-red-400 bg-red-900';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-900';
      case 'LOW': return 'text-green-400 bg-green-900';
      default: return 'text-gray-400 bg-gray-900';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Immediate': return 'text-red-400';
      case 'Within 2 hours': return 'text-orange-400';
      case 'Within 4 hours': return 'text-yellow-400';
      case 'Within 6 hours': return 'text-blue-400';
      default: return 'text-green-400';
    }
  };

  if (!modelFeatures) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <div className="font-mono text-gray-400">Loading features for ML model...</div>
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
            ← BACK TO ANALYTICS HUB
          </button>
          <h1 className="text-3xl font-mono font-bold text-blue-400">LIVE ML PREDICTIONS</h1>
          <div className="text-sm font-mono text-gray-400">
            Real-time API Integration
          </div>
        </div>

        {/* API Status & Controls */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${
                apiStatus?.status === 'connected' ? 'bg-green-500 animate-pulse' :
                apiStatus?.status === 'mock_mode' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <div>
                <div className="font-mono text-sm">
                  Status: <span className={
                    apiStatus?.status === 'connected' ? 'text-green-400' :
                    apiStatus?.status === 'mock_mode' ? 'text-yellow-400' : 'text-red-400'
                  }>{apiStatus?.status?.toUpperCase()}</span>
                </div>
                <div className="font-mono text-xs text-gray-400">{apiStatus?.message}</div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={checkApiStatus}
                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs font-mono transition-colors"
              >
                🔄 CHECK STATUS
              </button>
              <button
                onClick={copyFeaturesForAPI}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-mono transition-colors"
              >
                📋 COPY API PAYLOAD
              </button>
              <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                🔁 AUTO REFRESH
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Model Features */}
          <div className="lg:col-span-1 bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-mono font-bold mb-4 text-green-400">🤖 MODEL INPUT</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {Object.entries(modelFeatures).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center text-sm">
                  <span className="font-mono text-gray-400 capitalize">
                    {key.replace(/_/g, ' ')}:
                  </span>
                  <span className="font-mono text-white">
                    {typeof value === 'number' ? value.toFixed(2) : value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center text-xs text-gray-400 font-mono">
              {Object.keys(modelFeatures).length} features sent to ML API
            </div>
          </div>

          {/* Prediction Results */}
          <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-mono font-bold text-purple-400">🔮 PREDICTION RESULTS</h3>
              <button
                onClick={getPrediction}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-mono text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    PREDICTING...
                  </>
                ) : (
                  '🚀 GET PREDICTION'
                )}
              </button>
            </div>

            {prediction ? (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-750 p-4 rounded border border-gray-600 text-center">
                    <div className="text-gray-400 font-mono text-sm">Wait Time</div>
                    <div className="text-2xl font-mono text-orange-400">
                      {prediction.predicted_wait_time} min
                    </div>
                  </div>
                  <div className="bg-gray-750 p-4 rounded border border-gray-600 text-center">
                    <div className="text-gray-400 font-mono text-sm">Congestion</div>
                    <div className={`text-2xl font-mono ${
                      prediction.congestion_level === 'HIGH' ? 'text-red-400' :
                      prediction.congestion_level === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {prediction.congestion_level}
                    </div>
                  </div>
                  <div className="bg-gray-750 p-4 rounded border border-gray-600 text-center">
                    <div className="text-gray-400 font-mono text-sm">Confidence</div>
                    <div className="text-2xl font-mono text-blue-400">
                      {(prediction.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-gray-750 p-4 rounded border border-gray-600 text-center">
                    <div className="text-gray-400 font-mono text-sm">Risk Score</div>
                    <div className={`text-2xl font-mono ${
                      (prediction.risk_score || 0) > 60 ? 'text-red-400' :
                      (prediction.risk_score || 0) > 30 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {prediction.risk_score || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="font-mono font-bold text-cyan-400 mb-3">🎯 RECOMMENDATIONS</h4>
                  <div className="space-y-3">
                    {prediction.recommendations?.map((rec, index) => (
                      <div key={index} className="bg-gray-750 p-4 rounded border border-gray-600">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-mono ${getPriorityColor(rec.priority)}`}>
                            {rec.priority} PRIORITY
                          </span>
                          <span className={`text-xs font-mono ${getUrgencyColor(rec.urgency)}`}>
                            {rec.urgency}
                          </span>
                        </div>
                        <div className="font-mono text-sm text-white mb-1">{rec.action}</div>
                        <div className="font-mono text-xs text-gray-400">Impact: {rec.impact}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Model Info */}
                <div className="flex justify-between items-center text-xs text-gray-400 font-mono">
                  <span>Model: {prediction.model_version || 'unknown'}</span>
                  <span>Features: {prediction.features_used || Object.keys(modelFeatures).length}</span>
                  <span>{prediction.is_mock ? 'Mock Prediction' : 'Live Prediction'}</span>
                  <span>Updated: {new Date(prediction.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 font-mono">
                Click "GET PREDICTION" to see ML model results
                <div className="text-xs mt-2">Features are ready - waiting for prediction request</div>
              </div>
            )}
          </div>
        </div>

        {/* Prediction History */}
        {predictionHistory.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
            <h3 className="text-xl font-mono font-bold mb-4 text-yellow-400">📈 PREDICTION HISTORY</h3>
            <div className="h-64">
              <LineChart 
                data={predictionHistory.map(p => p.predicted_wait_time).reverse()}
                labels={predictionHistory.map(p => p.timestamp).reverse()}
                title="Predicted Wait Time Over Time"
                color="#F59E0B"
              />
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="text-center">
                <div className="text-gray-400">Avg Wait Time</div>
                <div className="text-orange-400">
                  {Math.round(predictionHistory.reduce((sum, p) => sum + p.predicted_wait_time, 0) / predictionHistory.length)} min
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">High Congestion</div>
                <div className="text-red-400">
                  {predictionHistory.filter(p => p.congestion_level === 'HIGH').length} times
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Avg Confidence</div>
                <div className="text-blue-400">
                  {((predictionHistory.reduce((sum, p) => sum + p.confidence, 0) / predictionHistory.length) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Total Predictions</div>
                <div className="text-green-400">{predictionHistory.length}</div>
              </div>
            </div>
          </div>
        )}

        {/* API Integration Guide */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-mono font-bold mb-4 text-green-400">🔗 API INTEGRATION GUIDE</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-mono font-bold text-cyan-400 mb-2">Backend API Example (Python):</h4>
              <pre className="text-xs bg-gray-900 p-4 rounded border border-gray-600 text-gray-300 overflow-x-auto">
{`from flask import Flask, request, jsonify
import pickle
import numpy as np

app = Flask(__name__)

# Load your trained model
model = pickle.load(open('port_congestion_model.pkl', 'rb'))

@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.json
    features = data['features']
    
    # Convert features to numpy array in correct order
    feature_names = ['hour_of_day', 'day_of_week', 'is_peak_hours', ...]
    feature_vector = [features[name] for name in feature_names]
    
    # Make prediction
    prediction = model.predict([feature_vector])[0]
    confidence = model.predict_proba([feature_vector]).max()
    
    return jsonify({
        'predicted_wait_time': int(prediction),
        'confidence': float(confidence),
        'congestion_level': 'HIGH' if prediction > 60 else 'MEDIUM' if prediction > 30 else 'LOW',
        'model_version': 'v1.0',
        'timestamp': data['timestamp']
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)`}
              </pre>
            </div>
            <div>
              <h4 className="font-mono font-bold text-blue-400 mb-2">Environment Setup:</h4>
              <div className="space-y-3 text-sm font-mono">
                <div className="text-green-400">1. Set REACT_APP_ML_API_URL in .env file</div>
                <div className="text-blue-400">2. Deploy your ML model as a REST API</div>
                <div className="text-yellow-400">3. Ensure CORS is configured for your domain</div>
                <div className="text-purple-400">4. Test with the "Copy API Payload" feature</div>
              </div>
              
              <h4 className="font-mono font-bold text-orange-400 mt-4 mb-2">.env.example:</h4>
              <pre className="text-xs bg-gray-900 p-3 rounded border border-gray-600 text-gray-300">
{`REACT_APP_ML_API_URL=http://localhost:8000/api
# OR for production:
# REACT_APP_ML_API_URL=https://your-ml-api.com/api`}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-gray-500 font-mono text-sm">
          LIVE ML PREDICTIONS | API INTEGRATION READY | {Object.keys(modelFeatures).length} FEATURES
        </div>
      </div>
    </div>
  );
};

export default LiveModelIntegration;
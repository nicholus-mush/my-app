import React, { useState, useEffect } from 'react';
import { vesselSimulator } from '../simulators/vesselSimulator';
import { berthSimulator } from '../simulators/berthSimulator';
import { craneSimulator } from '../simulators/craneSimulator';
import { truckSimulator } from '../simulators/truckSimulator';
import { weatherSimulator } from '../simulators/weatherSimulator';
import { enhancedFeatureEngine } from '../utils/featureEngine';

const ModelIntegration = ({ onBack }) => {
  const [vesselData, setVesselData] = useState(null);
  const [berthData, setBerthData] = useState(null);
  const [craneData, setCraneData] = useState(null);
  const [truckData, setTruckData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [modelFeatures, setModelFeatures] = useState(null);
  const [displayFeatures, setDisplayFeatures] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isSending, setIsSending] = useState(false);

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

      // Generate both model and display features
      const modelFeats = enhancedFeatureEngine.generateModelFeatures(operationalData);
      const displayFeats = enhancedFeatureEngine.generateDisplayFeatures(operationalData);
      
      setModelFeatures(modelFeats);
      setDisplayFeatures(displayFeats);
    }
  }, [vesselData, berthData, craneData, truckData, weatherData]);

  // Simulate ML model prediction
  const simulatePrediction = async () => {
    setIsSending(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock prediction based on features
    if (modelFeatures) {
      const congestionScore = modelFeatures.truck_congestion_index;
      const waitTime = modelFeatures.total_time_minutes;
      
      const mockPrediction = {
        predicted_wait_time: Math.round(waitTime * (1 + congestionScore / 100)),
        congestion_level: congestionScore > 40 ? 'HIGH' : congestionScore > 20 ? 'MEDIUM' : 'LOW',
        confidence: 0.85 + (Math.random() * 0.1),
        recommendation: this.generateRecommendation(congestionScore, waitTime),
        timestamp: new Date().toISOString()
      };
      
      setPrediction(mockPrediction);
    }
    
    setIsSending(false);
  };

  const generateRecommendation = (congestion, waitTime) => {
    if (congestion > 40 && waitTime > 60) {
      return "Dispatch additional trucks and optimize crane allocation";
    } else if (congestion > 25) {
      return "Monitor gate queues and adjust truck dispatch timing";
    } else {
      return "Operations running efficiently - maintain current schedule";
    }
  };

  // Copy features to clipboard for easy integration
  const copyFeaturesToClipboard = () => {
    if (modelFeatures) {
      const featuresJSON = enhancedFeatureEngine.getModelInputJSON({
        vessels: vesselData?.vessels || [],
        berths: berthData?.berths || [],
        cranes: craneData?.cranes || [],
        trucks: truckData?.trucks || [],
        weather: weatherData || {}
      });
      
      navigator.clipboard.writeText(featuresJSON);
      alert('Model features copied to clipboard!');
    }
  };

  if (!modelFeatures || !displayFeatures) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <div className="font-mono text-gray-400">Generating model features...</div>
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
          <h1 className="text-3xl font-mono font-bold text-blue-400">ML MODEL INTEGRATION</h1>
          <div className="text-sm font-mono text-gray-400">
            Feature Engineering & Prediction
          </div>
        </div>

        {/* Model Input Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-mono font-bold text-green-400">🤖 MODEL INPUT FEATURES</h3>
              <button
                onClick={copyFeaturesToClipboard}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-mono transition-colors"
              >
                📋 COPY JSON
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <pre className="text-xs font-mono text-gray-300 bg-gray-900 p-4 rounded border border-gray-600">
                {JSON.stringify(modelFeatures, null, 2)}
              </pre>
            </div>
            <div className="mt-3 text-xs text-gray-400 font-mono">
              {Object.keys(modelFeatures).length} features ready for ML model
            </div>
          </div>

          {/* Display Features (with metadata) */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-mono font-bold text-yellow-400 mb-4">📊 DISPLAY FEATURES</h3>
            <div className="max-h-96 overflow-y-auto">
              <pre className="text-xs font-mono text-gray-300 bg-gray-900 p-4 rounded border border-gray-600">
                {JSON.stringify(displayFeatures, null, 2)}
              </pre>
            </div>
            <div className="mt-3 text-xs text-gray-400 font-mono">
              Includes metadata for display purposes
            </div>
          </div>
        </div>

        {/* Prediction Section */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-mono font-bold text-purple-400">🔮 ML PREDICTION</h3>
            <button
              onClick={simulatePrediction}
              disabled={isSending}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-mono text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  PREDICTING...
                </>
              ) : (
                '🚀 RUN PREDICTION'
              )}
            </button>
          </div>

          {prediction ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-750 p-4 rounded border border-gray-600 text-center">
                <div className="text-gray-400 font-mono text-sm">Wait Time</div>
                <div className="text-2xl font-mono text-orange-400">{prediction.predicted_wait_time} min</div>
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
              <div className="bg-gray-750 p-4 rounded border border-gray-600">
                <div className="text-gray-400 font-mono text-sm mb-2">Recommendation</div>
                <div className="text-sm font-mono text-green-400">
                  {prediction.recommendation}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 font-mono">
              Click "RUN PREDICTION" to see ML model results
            </div>
          )}
        </div>

        {/* Feature Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center">
            <div className="text-3xl text-green-400 mb-2">{Object.keys(modelFeatures).length}</div>
            <div className="text-gray-400 font-mono text-sm">MODEL FEATURES</div>
            <div className="text-xs text-gray-500 mt-1">Cleaned for ML input</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center">
            <div className="text-3xl text-blue-400 mb-2">{Object.keys(displayFeatures).length}</div>
            <div className="text-gray-400 font-mono text-sm">DISPLAY FEATURES</div>
            <div className="text-xs text-gray-500 mt-1">Includes metadata</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center">
            <div className="text-3xl text-purple-400 mb-2">
              {enhancedFeatureEngine.getModelFeatureNames().length}
            </div>
            <div className="text-gray-400 font-mono text-sm">FEATURE NAMES</div>
            <div className="text-xs text-gray-500 mt-1">For model training</div>
          </div>
        </div>

        {/* Integration Instructions */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-mono font-bold mb-4 text-cyan-400">🔗 INTEGRATION GUIDE</h3>
          <div className="space-y-3 font-mono text-sm">
            <div className="text-green-400">1. Copy the Model Input Features JSON</div>
            <div className="text-blue-400">2. Send to your ML model API endpoint</div>
            <div className="text-yellow-400">3. Receive predictions for wait times and congestion</div>
            <div className="text-purple-400">4. Use predictions to optimize port operations</div>
          </div>
          <div className="mt-4 p-4 bg-gray-900 rounded border border-gray-600">
            <div className="text-gray-400 font-mono text-sm mb-2">Python Integration Example:</div>
            <pre className="text-xs text-gray-300">
{`# Example Python code to use these features
import requests
import json

features = ${enhancedFeatureEngine.getModelInputJSON({
  vessels: [], berths: [], cranes: [], trucks: [], weather: {}
}).substring(0, 100)}...

response = requests.post('your-ml-api/predict', 
  json=features)
prediction = response.json()`}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-gray-500 font-mono text-sm">
          ML READY FEATURES | REAL-TIME UPDATES | {Object.keys(modelFeatures).length} CLEAN FEATURES
        </div>
      </div>
    </div>
  );
};

export default ModelIntegration;
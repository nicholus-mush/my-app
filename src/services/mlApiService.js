// ML API Service for sending features and receiving predictions
class MLApiService {
  constructor() {
    // Fixed: Use window.location for browser environment instead of process.env
    this.baseURL = this.getConfigValue('REACT_APP_ML_API_URL', 'http://localhost:8000/api');
    this.isMockMode = this.shouldUseMockMode();
    
    // Preserve all your original configurations
    this.config = {
      timeout: 10000,
      retryAttempts: 3,
      version: '1.0',
      features: {
        enableRealTime: true,
        enableBatchProcessing: true,
        fallbackToMock: true
      }
    };
  }

  // Safe environment variable reader for browser
  getConfigValue(key, defaultValue) {
    // Check if we're in browser environment
    if (typeof window !== 'undefined') {
      // For React apps built with Create React App, variables are injected in window
      return window[`__${key}__`] || 
             (window._env_ && window._env_[key]) || 
             defaultValue;
    }
    // Fallback for other environments
    return defaultValue;
  }

  shouldUseMockMode() {
    const apiUrl = this.getConfigValue('REACT_APP_ML_API_URL', '');
    return !apiUrl || apiUrl === 'http://localhost:8000/api';
  }

  // Send features to ML model and get prediction
  async getPrediction(features) {
    if (this.isMockMode) {
      return this.getMockPrediction(features);
    }

    try {
      const response = await fetch(`${this.baseURL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          features: features,
          timestamp: new Date().toISOString(),
          version: this.config.version
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const prediction = await response.json();
      return this.validatePrediction(prediction);
    } catch (error) {
      console.error('ML API Error:', error);
      // Fallback to mock prediction based on your configuration
      if (this.config.features.fallbackToMock) {
        return this.getMockPrediction(features);
      }
      throw error;
    }
  }

  // Mock prediction for development - PRESERVED YOUR EXACT LOGIC
  getMockPrediction(features) {
    // Simulate API delay
    return new Promise(resolve => {
      setTimeout(() => {
        const congestionScore = features.truck_congestion_index || 0;
        const waitTime = features.total_time_minutes || 30;
        const vesselImpact = (features.vessels_containers_to_discharge || 0) / 1000;
        
        const predictedWaitTime = Math.round(
          waitTime * (1 + congestionScore / 100) + vesselImpact * 5
        );

        const prediction = {
          predicted_wait_time: Math.max(15, Math.min(180, predictedWaitTime)),
          congestion_level: congestionScore > 40 ? 'HIGH' : congestionScore > 20 ? 'MEDIUM' : 'LOW',
          confidence: 0.82 + (Math.random() * 0.15),
          recommendations: this.generateRecommendations(features),
          risk_score: Math.round(congestionScore + vesselImpact * 10),
          timestamp: new Date().toISOString(),
          model_version: 'mock_v1.2',
          features_used: Object.keys(features).length,
          is_mock: true
        };

        resolve(prediction);
      }, 800 + Math.random() * 700); // 0.8-1.5 second delay
    });
  }

  // Generate intelligent recommendations based on features - PRESERVED YOUR EXACT LOGIC
  generateRecommendations(features) {
    const recommendations = [];
    const congestion = features.truck_congestion_index || 0;
    const berthOccupancy = features.berth_occupancy_rate || 0;
    const craneUtilization = features.crane_utilization_rate || 0;
    const weatherImpact = 100 - (features.weather_impact_score || 100);

    if (congestion > 40) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Dispatch additional trucks to clear gate queues',
        impact: 'Reduce wait times by 25-40%',
        urgency: 'Immediate'
      });
    }

    if (berthOccupancy > 85) {
      recommendations.push({
        priority: 'HIGH', 
        action: 'Optimize vessel scheduling to reduce berth congestion',
        impact: 'Improve vessel turnaround by 15-30%',
        urgency: 'Within 2 hours'
      });
    }

    if (craneUtilization < 60) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Reallocate idle cranes to high-priority vessels',
        impact: 'Increase overall productivity by 10-20%',
        urgency: 'Within 4 hours'
      });
    }

    if (weatherImpact > 30) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Implement weather contingency protocols',
        impact: 'Maintain safety and reduce weather-related delays',
        urgency: 'Immediate'
      });
    }

    if (features.vessels_containers_to_discharge > 3000) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Prepare additional yard space for incoming containers',
        impact: 'Prevent yard congestion and optimize storage',
        urgency: 'Within 6 hours'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'LOW',
        action: 'Maintain current operational efficiency',
        impact: 'Continue monitoring for optimization opportunities',
        urgency: 'Ongoing'
      });
    }

    return recommendations;
  }

  // Validate prediction response from API - PRESERVED YOUR EXACT LOGIC
  validatePrediction(prediction) {
    const requiredFields = ['predicted_wait_time', 'congestion_level', 'confidence'];
    const missingFields = requiredFields.filter(field => !(field in prediction));

    if (missingFields.length > 0) {
      throw new Error(`Invalid prediction response: Missing fields ${missingFields.join(', ')}`);
    }

    return {
      ...prediction,
      timestamp: prediction.timestamp || new Date().toISOString(),
      is_mock: false
    };
  }

  // Get API status - PRESERVED YOUR EXACT LOGIC
  async getAPIStatus() {
    if (this.isMockMode) {
      return { status: 'mock_mode', message: 'Using mock predictions' };
    }

    try {
      const response = await fetch(`${this.baseURL}/health`);
      if (response.ok) {
        return { status: 'connected', message: 'ML API is connected' };
      } else {
        return { status: 'error', message: 'ML API health check failed' };
      }
    } catch (error) {
      return { status: 'disconnected', message: 'Cannot connect to ML API' };
    }
  }

  // Batch prediction for multiple feature sets - PRESERVED YOUR EXACT LOGIC
  async getBatchPredictions(featuresList) {
    if (this.isMockMode) {
      const predictions = await Promise.all(
        featuresList.map(features => this.getMockPrediction(features))
      );
      return predictions;
    }

    try {
      const response = await fetch(`${this.baseURL}/predict/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          features_list: featuresList,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Batch API Error: ${response.status}`);
      }

      const results = await response.json();
      return results.predictions.map(pred => this.validatePrediction(pred));
    } catch (error) {
      console.error('Batch ML API Error:', error);
      // Fallback to individual mock predictions
      const predictions = await Promise.all(
        featuresList.map(features => this.getMockPrediction(features))
      );
      return predictions;
    }
  }

  // Additional method to update configuration if needed
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  // Method to get current configuration
  getConfig() {
    return {
      ...this.config,
      baseURL: this.baseURL,
      isMockMode: this.isMockMode
    };
  }
}

// Create singleton instance
export const mlApiService = new MLApiService();
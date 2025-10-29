// Feature Engineering Engine for Port Operations
class FeatureEngine {
  constructor() {
    this.historicalData = [];
    this.maxHistorySize = 1000; // Keep last 1000 data points
  }

  // Time-based features
  extractTimeFeatures(timestamp) {
    const date = new Date(timestamp);
    const hour = date.getHours();
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    return {
      hour_of_day: hour,
      day_of_week: dayOfWeek,
      is_peak_hours: (hour >= 7 && hour <= 18) ? 1 : 0,
      is_weekend: isWeekend ? 1 : 0,
      month: date.getMonth(),
      is_morning_peak: (hour >= 6 && hour <= 10) ? 1 : 0,
      is_evening_peak: (hour >= 16 && hour <= 20) ? 1 : 0
    };
  }

  // Operational features from real-time data
  extractOperationalFeatures(operationalData) {
    const {
      vessels = [],
      berths = [],
      cranes = [],
      trucks = [],
      weather = {}
    } = operationalData;

    // Vessel features
    const incomingVessels = vessels.filter(v => v.status === 'incoming').length;
    const arrivedVessels = vessels.filter(v => v.status === 'arrived').length;
    const totalVessels = vessels.length;

    // Berth features
    const totalBerths = berths.length;
    const occupiedBerths = berths.filter(b => b.status === 'occupied').length;
    const availableBerths = berths.filter(b => b.status === 'available').length;
    const maintenanceBerths = berths.filter(b => b.status === 'maintenance').length;

    // Crane features
    const totalCranes = cranes.length;
    const operationalCranes = cranes.filter(c => c.status === 'operational').length;
    const idleCranes = cranes.filter(c => c.status === 'idle').length;
    const maintenanceCranes = cranes.filter(c => c.status === 'maintenance').length;

    // Truck features
    const totalTrucks = trucks.length;
    const waitingTrucks = trucks.filter(t => t.status === 'waiting').length;
    const loadingTrucks = trucks.filter(t => t.status === 'loading').length;
    const unloadingTrucks = trucks.filter(t => t.status === 'unloading').length;
    const travelingTrucks = trucks.filter(t => t.status === 'traveling').length;
    const maintenanceTrucks = trucks.filter(t => t.status === 'maintenance').length;

    // Calculate derived features
    return {
      // Vessel metrics
      incoming_vessel_count: incomingVessels,
      arrived_vessel_count: arrivedVessels,
      vessel_occupancy_rate: totalVessels > 0 ? (arrivedVessels / totalVessels) * 100 : 0,
      
      // Berth metrics
      berth_occupancy_rate: totalBerths > 0 ? (occupiedBerths / totalBerths) * 100 : 0,
      berth_availability_rate: totalBerths > 0 ? (availableBerths / totalBerths) * 100 : 0,
      berth_maintenance_rate: totalBerths > 0 ? (maintenanceBerths / totalBerths) * 100 : 0,
      
      // Crane metrics
      crane_utilization_rate: totalCranes > 0 ? (operationalCranes / totalCranes) * 100 : 0,
      crane_idle_rate: totalCranes > 0 ? (idleCranes / totalCranes) * 100 : 0,
      crane_maintenance_rate: totalCranes > 0 ? (maintenanceCranes / totalCranes) * 100 : 0,
      
      // Truck metrics
      truck_congestion_index: totalTrucks > 0 ? (waitingTrucks / totalTrucks) * 100 : 0,
      truck_loading_rate: totalTrucks > 0 ? (loadingTrucks / totalTrucks) * 100 : 0,
      truck_unloading_rate: totalTrucks > 0 ? (unloadingTrucks / totalTrucks) * 100 : 0,
      truck_traveling_rate: totalTrucks > 0 ? (travelingTrucks / totalTrucks) * 100 : 0,
      truck_maintenance_rate: totalTrucks > 0 ? (maintenanceTrucks / totalTrucks) * 100 : 0,
      
      // Queue metrics
      gate_queue_size: trucks.filter(t => t.currentLocation === 'Gate' && t.status === 'waiting').length,
      yard_queue_size: trucks.filter(t => t.currentLocation === 'Yard' && t.status === 'waiting').length
    };
  }

  // Weather impact scoring
  calculateWeatherImpact(weatherData) {
    let impactScore = 100; // Start with perfect conditions
    
    // Wind impact
    if (weatherData.windSpeed > 50) impactScore -= 40;
    else if (weatherData.windSpeed > 25) impactScore -= 20;
    else if (weatherData.windSpeed > 15) impactScore -= 10;

    // Visibility impact
    if (weatherData.visibility < 2) impactScore -= 25;
    else if (weatherData.visibility < 5) impactScore -= 15;
    else if (weatherData.visibility < 10) impactScore -= 5;

    // Temperature impact
    if (weatherData.temperature > 35) impactScore -= 15;
    else if (weatherData.temperature > 30) impactScore -= 10;
    else if (weatherData.temperature < 0) impactScore -= 10;
    else if (weatherData.temperature < 5) impactScore -= 5;

    // Precipitation impact
    if (weatherData.conditions === 'storm') impactScore -= 40;
    else if (weatherData.conditions === 'rain') impactScore -= 20;
    else if (weatherData.conditions === 'fog') impactScore -= 15;
    else if (weatherData.conditions === 'cloudy') impactScore -= 5;

    return Math.max(0, Math.min(100, impactScore));
  }

  // Tidal conditions (simplified - in real app, integrate with tidal API)
  getTidalConditions(timestamp) {
    const date = new Date(timestamp);
    const hour = date.getHours();
    
    // Simplified tidal pattern (high tide every 6 hours)
    const tideCycle = hour % 6;
    if (tideCycle === 0) return 'high_tide';
    if (tideCycle === 3) return 'low_tide';
    return 'mid_tide';
  }

  // Calculate total waiting time prediction
  predictTotalWaitingTime(features) {
    // Base waiting time in minutes
    let baseWaitTime = 30;
    
    // Add congestion impact
    baseWaitTime += (features.truck_congestion_index / 100) * 60;
    
    // Add berth occupancy impact
    baseWaitTime += (features.berth_occupancy_rate / 100) * 45;
    
    // Add weather impact
    const weatherImpact = (100 - features.weather_impact_score) / 100;
    baseWaitTime += weatherImpact * 30;
    
    // Peak hours multiplier
    if (features.is_peak_hours) baseWaitTime *= 1.5;
    
    // Weekend adjustment (usually less congestion)
    if (features.is_weekend) baseWaitTime *= 0.8;
    
    return Math.round(baseWaitTime);
  }

  // Predict future congestion based on vessel schedules
  predictFutureCongestion(vesselSchedule, currentFeatures, hoursAhead = 24) {
    const predictions = [];
    const currentTime = new Date();
    
    for (let i = 1; i <= hoursAhead; i++) {
      const predictionTime = new Date(currentTime.getTime() + i * 60 * 60 * 1000);
      const timeFeatures = this.extractTimeFeatures(predictionTime);
      
      // Count vessels expected to arrive in this hour
      const vesselsInThisHour = vesselSchedule.filter(vessel => {
        const vesselETA = new Date(vessel.eta);
        return vesselETA.getHours() === predictionTime.getHours() &&
               vesselETA.getDate() === predictionTime.getDate();
      }).length;
      
      // Calculate predicted congestion
      const baseCongestion = currentFeatures.truck_congestion_index;
      const vesselImpact = vesselsInThisHour * 8; // Each vessel adds 8% to congestion
      const timeImpact = timeFeatures.is_peak_hours ? 15 : -5;
      
      const predictedCongestion = Math.min(100, Math.max(0, 
        baseCongestion + vesselImpact + timeImpact
      ));
      
      // Determine congestion level
      let congestionLevel = 'LOW';
      if (predictedCongestion > 40) congestionLevel = 'HIGH';
      else if (predictedCongestion > 20) congestionLevel = 'MEDIUM';
      
      predictions.push({
        hour: predictionTime.getHours(),
        time: predictionTime.toLocaleTimeString([], {hour: '2-digit'}),
        predicted_congestion: Math.round(predictedCongestion),
        congestion_level: congestionLevel,
        expected_vessels: vesselsInThisHour,
        is_peak: timeFeatures.is_peak_hours
      });
    }
    
    return predictions;
  }

  // Generate comprehensive feature set
  generateFeatures(operationalData) {
    const timestamp = operationalData.timestamp || new Date().toISOString();
    
    const timeFeatures = this.extractTimeFeatures(timestamp);
    const operationalFeatures = this.extractOperationalFeatures(operationalData);
    const weatherImpact = this.calculateWeatherImpact(operationalData.weather || {});
    const tidalConditions = this.getTidalConditions(timestamp);
    
    // Combine all features
    const allFeatures = {
      timestamp,
      ...timeFeatures,
      ...operationalFeatures,
      weather_impact_score: weatherImpact,
      tidal_conditions: tidalConditions,
      total_waiting_time: this.predictTotalWaitingTime({
        ...operationalFeatures,
        weather_impact_score: weatherImpact,
        ...timeFeatures
      })
    };
    
    // Store in history
    this.historicalData.push(allFeatures);
    if (this.historicalData.length > this.maxHistorySize) {
      this.historicalData = this.historicalData.slice(-this.maxHistorySize);
    }
    
    return allFeatures;
  }

  // Get feature trends (moving averages)
  getFeatureTrends(windowSize = 10) {
    if (this.historicalData.length < windowSize) return null;
    
    const recentData = this.historicalData.slice(-windowSize);
    const trends = {};
    
    // Calculate moving averages for key metrics
    const metrics = [
      'truck_congestion_index', 
      'crane_utilization_rate', 
      'berth_occupancy_rate',
      'weather_impact_score',
      'total_waiting_time'
    ];
    
    metrics.forEach(metric => {
      const values = recentData.map(d => d[metric]);
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      const trend = values[values.length - 1] - values[0];
      
      trends[metric] = {
        current: values[values.length - 1],
        average: Math.round(average * 10) / 10,
        trend: Math.round(trend * 10) / 10,
        direction: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable'
      };
    });
    
    return trends;
  }

  // Generate vessel schedule from current vessels
  generateVesselSchedule(vessels) {
    return vessels
      .filter(vessel => vessel.status === 'incoming')
      .map(vessel => ({
        id: vessel.id,
        eta: vessel.eta, // Expected Time of Arrival
        size: vessel.size,
        cargo: vessel.cargo,
        // Convert ETA string to Date object
        etaDate: new Date(new Date().toDateString() + ' ' + vessel.eta)
      }))
      .sort((a, b) => a.etaDate - b.etaDate);
  }
}

// Create singleton instance
export const featureEngine = new FeatureEngine();

// Enhanced Feature Engine with Model Output
class EnhancedFeatureEngine {
  constructor() {
    this.historicalData = [];
    this.vesselHistory = [];
    this.truckHistory = [];
    this.berthHistory = [];
    this.maxHistorySize = 1000;
    this.operationStartTimes = new Map();
  }

  // ADD THIS MISSING METHOD - Enhanced feature generation for ML model input
  generateEnhancedFeatures(operationalData) {
    const timestamp = operationalData.timestamp || new Date().toISOString();
    
    // Get base features from the parent FeatureEngine
    const baseFeatures = featureEngine.generateFeatures(operationalData);
    
    // Enhanced vessel features
    const enhancedVesselFeatures = this.extractEnhancedVesselFeatures(operationalData.vessels || []);
    
    // Enhanced truck features
    const enhancedTruckFeatures = this.extractEnhancedTruckFeatures(operationalData.trucks || []);
    
    // Historical features (lag features)
    const historicalFeatures = this.calculateHistoricalFeatures();
    
    // Weather and environmental features
    const environmentalFeatures = this.extractEnvironmentalFeatures(operationalData.weather || {});
    
    // Combine all features
    const enhancedFeatures = {
      ...baseFeatures,
      ...enhancedVesselFeatures,
      ...enhancedTruckFeatures,
      ...historicalFeatures,
      ...environmentalFeatures,
      
      // Enhanced metadata
      feature_set: 'enhanced_v2.0',
      processing_timestamp: timestamp,
      data_quality_score: this.calculateDataQuality(operationalData)
    };
    
    // Store in enhanced history
    this.historicalData.push(enhancedFeatures);
    if (this.historicalData.length > this.maxHistorySize) {
      this.historicalData = this.historicalData.slice(-this.maxHistorySize);
    }
    
    return enhancedFeatures;
  }

  // Enhanced vessel feature extraction for ML input
  extractEnhancedVesselFeatures(vessels) {
    const currentTime = new Date();
    const incomingVessels = vessels.filter(v => v.status === 'incoming');
    const arrivedVessels = vessels.filter(v => v.status === 'arrived');
    
    // Calculate container metrics for ML predictions
    const totalContainersToDischarge = vessels.reduce((sum, vessel) => 
      sum + (vessel.containers_to_discharge || 0), 0);
    
    const totalContainersLoaded = vessels.reduce((sum, vessel) => 
      sum + (vessel.containers_loaded || 0), 0);
    
    // Calculate docked durations for time predictions
    const averageDockedDuration = arrivedVessels.length > 0 ? 
      arrivedVessels.reduce((sum, vessel) => sum + (vessel.docked_minutes || 0), 0) / arrivedVessels.length : 0;
    
    // Berth assignment rate for resource optimization
    const vesselsWithBerth = arrivedVessels.filter(v => v.berth).length;
    const berthAssignmentRate = arrivedVessels.length > 0 ? 
      (vesselsWithBerth / arrivedVessels.length) * 100 : 0;
    
    return {
      // Container metrics for workload prediction
      total_containers_to_discharge: totalContainersToDischarge,
      total_containers_loaded: totalContainersLoaded,
      containers_offloaded: totalContainersLoaded, // For ML model compatibility
      
      // Time-based metrics for duration prediction
      vessels_docked_duration: averageDockedDuration,
      average_docked_duration: averageDockedDuration,
      
      // Resource allocation metrics
      berth_assigned: vesselsWithBerth,
      berth_assignment_rate: berthAssignmentRate,
      vessels_with_berth: vesselsWithBerth,
      
      // Vessel composition for pattern recognition
      largest_vessel_size: this.getLargestVesselSize(vessels),
      cargo_type_distribution: this.getCargoTypeDistribution(vessels),
      
      // Processing time estimates
      total_time_minutes: this.estimateTotalProcessingTime(vessels),
      processing_time_minutes: this.estimateAverageProcessingTime(vessels)
    };
  }

  // Enhanced truck feature extraction for congestion prediction
  extractEnhancedTruckFeatures(trucks) {
    if (trucks.length === 0) {
      return {
        total_trucks: 0,
        average_wait_time: 0,
        max_wait_time: 0,
        truck_utilization_rate: 0,
        gate_to_yard_time: 0,
        truck_type: 'standard'
      };
    }
    
    const waitingTrucks = trucks.filter(t => t.status === 'waiting');
    const activeTrucks = trucks.filter(t => 
      t.status === 'loading' || t.status === 'unloading' || t.status === 'traveling'
    );
    
    const waitTimes = trucks.map(t => t.wait_minutes || 0);
    const averageWaitTime = waitTimes.reduce((sum, time) => sum + time, 0) / waitTimes.length;
    const maxWaitTime = Math.max(...waitTimes);
    
    return {
      total_trucks: trucks.length,
      waiting_trucks_count: waitingTrucks.length,
      active_trucks_count: activeTrucks.length,
      average_wait_time: averageWaitTime,
      max_wait_time: maxWaitTime,
      truck_utilization_rate: (activeTrucks.length / trucks.length) * 100,
      gate_to_yard_time: this.estimateGateToYardTime(trucks),
      truck_type: this.getDominantTruckType(trucks)
    };
  }

  // Environmental features for weather impact prediction
  extractEnvironmentalFeatures(weatherData) {
    return {
      precipitation_mm: weatherData.precipitation || 0,
      temperature: weatherData.temperature || 20,
      wind_speed: weatherData.windSpeed || 10,
      visibility: weatherData.visibility || 10,
      weather_conditions: weatherData.conditions || 'clear'
    };
  }

  // Historical feature calculations (lag features for time series ML models)
  calculateHistoricalFeatures() {
    if (this.historicalData.length < 2) {
      return this.getDefaultHistoricalFeatures();
    }
    
    const recentData = this.historicalData.slice(-12); // Last 12 data points (assuming 5-min intervals = 1 hour)
    
    return {
      // Lag features for temporal pattern recognition
      vessels_containers_to_discharge_lag_4h: this.calculateLagFeature(recentData, 'total_containers_to_discharge', 4),
      vessels_docked_duration_lag_4h: this.calculateLagFeature(recentData, 'average_docked_duration', 4),
      vessels_docked_duration_lag_6h: this.calculateLagFeature(recentData, 'average_docked_duration', 6),
      vessels_containers_to_discharge_lag_12h: this.calculateLagFeature(recentData, 'total_containers_to_discharge', 12),
      vessels_docked_duration_lag_12h: this.calculateLagFeature(recentData, 'average_docked_duration', 12),
      
      // Moving averages for trend analysis
      queue_last_2h_avg: this.calculateMovingAverage(recentData, 'gate_queue_size', 4),
      processed_last_2h_avg: this.calculateMovingAverage(recentData, 'total_containers_loaded', 4),
      
      // Rate of change features
      congestion_trend: this.calculateTrend(recentData, 'truck_congestion_index'),
      utilization_trend: this.calculateTrend(recentData, 'crane_utilization_rate')
    };
  }

  // Helper methods for feature calculations
  calculateLagFeature(data, featureName, lagPeriods) {
    if (data.length <= lagPeriods) return 0;
    return data[data.length - lagPeriods - 1]?.[featureName] || 0;
  }

  calculateMovingAverage(data, featureName, periods) {
    if (data.length < periods) return 0;
    const recent = data.slice(-periods);
    const sum = recent.reduce((total, point) => total + (point[featureName] || 0), 0);
    return sum / periods;
  }

  calculateTrend(data, featureName) {
    if (data.length < 2) return 0;
    const current = data[data.length - 1][featureName] || 0;
    const previous = data[data.length - 2][featureName] || 0;
    return current - previous;
  }

  getDefaultHistoricalFeatures() {
    return {
      vessels_containers_to_discharge_lag_4h: 0,
      vessels_docked_duration_lag_4h: 0,
      vessels_docked_duration_lag_6h: 0,
      vessels_containers_to_discharge_lag_12h: 0,
      vessels_docked_duration_lag_12h: 0,
      queue_last_2h_avg: 0,
      processed_last_2h_avg: 0,
      congestion_trend: 0,
      utilization_trend: 0
    };
  }

  // Vessel analysis helpers
  getLargestVesselSize(vessels) {
    if (vessels.length === 0) return 'medium';
    const sizeWeights = { small: 1, medium: 2, large: 3 };
    const largest = vessels.reduce((largest, vessel) => 
      sizeWeights[vessel.size] > sizeWeights[largest.size] ? vessel : largest
    );
    return largest.size;
  }

  getCargoTypeDistribution(vessels) {
    const distribution = {};
    vessels.forEach(vessel => {
      distribution[vessel.cargo] = (distribution[vessel.cargo] || 0) + 1;
    });
    
    // Return the most common cargo type for ML encoding
    let mostCommon = 'general';
    let maxCount = 0;
    Object.entries(distribution).forEach(([cargo, count]) => {
      if (count > maxCount) {
        mostCommon = cargo;
        maxCount = count;
      }
    });
    
    return mostCommon;
  }

  getDominantTruckType(trucks) {
    const typeCount = {};
    trucks.forEach(truck => {
      const type = truck.type || 'standard';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
    
    let dominantType = 'standard';
    let maxCount = 0;
    Object.entries(typeCount).forEach(([type, count]) => {
      if (count > maxCount) {
        dominantType = type;
        maxCount = count;
      }
    });
    
    return dominantType;
  }

  estimateGateToYardTime(trucks) {
    const waitingTrucks = trucks.filter(t => t.status === 'waiting').length;
    return Math.max(5, waitingTrucks * 2); // 2 minutes per truck in queue
  }

  estimateTotalProcessingTime(vessels) {
    const totalContainers = vessels.reduce((sum, vessel) => sum + (vessel.containers_to_discharge || 0), 0);
    return totalContainers * 2; // 2 minutes per container estimate
  }

  estimateAverageProcessingTime(vessels) {
    if (vessels.length === 0) return 0;
    const totalTime = this.estimateTotalProcessingTime(vessels);
    return totalTime / vessels.length;
  }

  calculateDataQuality(operationalData) {
    let qualityScore = 100;
    
    // Deduct points for missing data
    if (!operationalData.vessels || operationalData.vessels.length === 0) qualityScore -= 20;
    if (!operationalData.trucks || operationalData.trucks.length === 0) qualityScore -= 15;
    if (!operationalData.berths || operationalData.berths.length === 0) qualityScore -= 10;
    if (!operationalData.cranes || operationalData.cranes.length === 0) qualityScore -= 10;
    
    return Math.max(0, Math.min(100, qualityScore));
  }

  // Generate features for MODEL INPUT (excludes metadata)
  generateModelFeatures(operationalData) {
    const timestamp = new Date();
    
    // Get all features first
    const allFeatures = this.generateEnhancedFeatures(operationalData);
    
    // Extract only model features (exclude metadata)
    const modelFeatures = {
      // Time-based features
      'hour_of_day': allFeatures.hour_of_day,
      'day_of_week': allFeatures.day_of_week,
      'is_peak_hours': allFeatures.is_peak_hours,
      'is_weekend': allFeatures.is_weekend,
      'month': allFeatures.month,
      'is_morning_peak': allFeatures.is_morning_peak,
      'is_evening_peak': allFeatures.is_evening_peak,
      
      // Operational features
      'incoming_vessel_count': allFeatures.incoming_vessel_count,
      'arrived_vessel_count': allFeatures.arrived_vessel_count,
      'vessel_occupancy_rate': allFeatures.vessel_occupancy_rate,
      'berth_occupancy_rate': allFeatures.berth_occupancy_rate,
      'berth_availability_rate': allFeatures.berth_availability_rate,
      'berth_maintenance_rate': allFeatures.berth_maintenance_rate,
      'crane_utilization_rate': allFeatures.crane_utilization_rate,
      'crane_idle_rate': allFeatures.crane_idle_rate,
      'crane_maintenance_rate': allFeatures.crane_maintenance_rate,
      'truck_congestion_index': allFeatures.truck_congestion_index,
      'truck_loading_rate': allFeatures.truck_loading_rate,
      'truck_unloading_rate': allFeatures.truck_unloading_rate,
      'truck_traveling_rate': allFeatures.truck_traveling_rate,
      'truck_maintenance_rate': allFeatures.truck_maintenance_rate,
      'gate_queue_size': allFeatures.gate_queue_size,
      'yard_queue_size': allFeatures.yard_queue_size,
      
      // Enhanced features for model
      'total_time_minutes': allFeatures.total_time_minutes,
      'processing_time_minutes': allFeatures.processing_time_minutes,
      'containers_offloaded': allFeatures.containers_offloaded,
      'vessels_containers_loaded': allFeatures.vessels_containers_loaded,
      'vessels_containers_to_discharge': allFeatures.vessels_containers_to_discharge,
      'vessels_docked_duration': allFeatures.vessels_docked_duration,
      'berth_assigned': allFeatures.berth_assigned,
      'vessels_containers_to_discharge_lag_4h': allFeatures.vessels_containers_to_discharge_lag_4h,
      'vessels_docked_duration_lag_4h': allFeatures.vessels_docked_duration_lag_4h,
      'vessels_docked_duration_lag_6h': allFeatures.vessels_docked_duration_lag_6h,
      'vessels_containers_to_discharge_lag_12h': allFeatures.vessels_containers_to_discharge_lag_12h,
      'vessels_docked_duration_lag_12h': allFeatures.vessels_docked_duration_lag_12h,
      'queue_last_2h_avg': allFeatures.queue_last_2h_avg,
      'processed_last_2h_avg': allFeatures.processed_last_2h_avg,
      'precipitation_mm': allFeatures.precipitation_mm,
      'weather_impact_score': allFeatures.weather_impact_score,
      'tidal_conditions': this.encodeTidalConditions(allFeatures.tidal_conditions),
      
      // Categorical features encoded
      'truck_type': this.encodeTruckType(allFeatures.truck_type),
      'cargo_type': this.encodeCargoType(allFeatures.cargo_type)
    };

    return modelFeatures;
  }

  // Generate features for DISPLAY (includes everything)
  generateDisplayFeatures(operationalData) {
    const allFeatures = this.generateEnhancedFeatures(operationalData);
    
    // Add metadata for display
    const displayFeatures = {
      ...allFeatures,
      // Metadata for display
      'timestamp': new Date().toISOString(),
      'truck_id': this.generateTruckId(operationalData.trucks),
      'arrival_time': this.calculateAverageArrivalTime(operationalData.trucks),
      'departure_time': this.calculateAverageDepartureTime(operationalData.trucks),
      'feature_version': 'v2.0',
      'data_source': 'port_simulation'
    };

    return displayFeatures;
  }

  // Encode categorical variables for model input
  encodeTidalConditions(tidalCondition) {
    const encoding = {
      'high_tide': 2,
      'mid_tide': 1, 
      'low_tide': 0
    };
    return encoding[tidalCondition] || 1;
  }

  encodeTruckType(truckType) {
    const encoding = {
      'standard': 0,
      'heavy_duty': 1,
      'refrigerated': 2
    };
    return encoding[truckType] || 0;
  }

  encodeCargoType(cargoType) {
    const encoding = {
      'containers': 0,
      'bulk': 1,
      'oil': 2,
      'general': 3
    };
    return encoding[cargoType] || 3;
  }

  // Generate a representative truck ID for the current state
  generateTruckId(trucks) {
    if (!trucks || trucks.length === 0) return 'TRK_AVG';
    
    // Return ID of truck with median wait time
    const sortedTrucks = [...trucks].sort((a, b) => 
      (a.wait_minutes || 0) - (b.wait_minutes || 0)
    );
    const medianIndex = Math.floor(sortedTrucks.length / 2);
    return sortedTrucks[medianIndex]?.id || 'TRK_AVG';
  }

  // Calculate average arrival time across trucks
  calculateAverageArrivalTime(trucks) {
    if (!trucks || trucks.length === 0) return new Date().toISOString();
    
    // Simulate average arrival time (1 hour ago)
    const avgArrival = new Date(Date.now() - 60 * 60 * 1000);
    return avgArrival.toISOString();
  }

  // Calculate average departure time
  calculateAverageDepartureTime(trucks) {
    if (!trucks || trucks.length === 0) return new Date().toISOString();
    
    // Simulate average departure time (30 minutes from now)
    const avgDeparture = new Date(Date.now() + 30 * 60 * 1000);
    return avgDeparture.toISOString();
  }

  // Get model-ready features as JSON string for API calls
  getModelInputJSON(operationalData) {
    const modelFeatures = this.generateModelFeatures(operationalData);
    return JSON.stringify(modelFeatures);
  }

  // Get model features as array (for Python ML model)
  getModelInputArray(operationalData) {
    const modelFeatures = this.generateModelFeatures(operationalData);
    return Object.values(modelFeatures);
  }

  // Get feature names for model input
  getModelFeatureNames() {
    const sampleFeatures = this.generateModelFeatures({
      vessels: [], berths: [], cranes: [], trucks: [], weather: {}
    });
    
    return Object.keys(sampleFeatures);
  }
}

export const enhancedFeatureEngine = new EnhancedFeatureEngine();
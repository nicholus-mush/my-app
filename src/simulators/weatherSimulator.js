class WeatherSimulator {
  constructor() {
    this.weather = {
      temperature: 20,
      humidity: 65,
      windSpeed: 10,
      windDirection: "NE",
      conditions: "clear",
      pressure: 1013,
      visibility: 10
    };
    this.conditions = ["clear", "partly_cloudy", "cloudy", "rain", "storm", "fog"];
    this.windDirections = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    this.isRunning = false;
    this.intervalId = null;
    this.listeners = new Set();
  }

  onData(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  emitData(data) {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in weather data listener:', error);
      }
    });
  }

  simulate() {
    // Simulate gradual weather changes
    this.weather.temperature += (Math.random() - 0.5) * 2;
    this.weather.temperature = Math.max(-5, Math.min(40, this.weather.temperature));
    
    this.weather.humidity += (Math.random() - 0.5) * 10;
    this.weather.humidity = Math.max(20, Math.min(95, this.weather.humidity));
    
    this.weather.windSpeed += (Math.random() - 0.5) * 5;
    this.weather.windSpeed = Math.max(0, Math.min(100, this.weather.windSpeed));
    
    this.weather.pressure += (Math.random() - 0.5) * 2;
    this.weather.pressure = Math.max(980, Math.min(1040, this.weather.pressure));
    
    this.weather.visibility += (Math.random() - 0.5) * 2;
    this.weather.visibility = Math.max(0, Math.min(20, this.weather.visibility));

    //PRESPITATION DATA
    this.weather.precipitation_mm = this.conditions === 'rain' ? 
      Math.random() * 10 :
      this.conditions === 'storm' ? Math.random() * 25 : 0;
      

    // Occasionally change wind direction and conditions
    if (Math.random() < 0.1) {
      this.weather.windDirection = this.windDirections[Math.floor(Math.random() * this.windDirections.length)];
    }
    
    if (Math.random() < 0.05) {
      this.weather.conditions = this.conditions[Math.floor(Math.random() * this.conditions.length)];
    }

    this.weather.timestamp = new Date().toISOString();

    this.emitData({
      ...this.weather,
      isRunning: this.isRunning,
      timestamp: this.weather.timestamp
    });
  }

  getWeatherImpact() {
    const impacts = [];
    
    if (this.weather.windSpeed > 50) impacts.push("High winds - Crane operations suspended");
    if (this.weather.conditions === "storm") impacts.push("Storm - All outdoor operations affected");
    if (this.weather.visibility < 2) impacts.push("Low visibility - Reduced operational speed");
    if (this.weather.temperature > 35) impacts.push("High temperature - Equipment monitoring required");
    if (this.weather.conditions === "rain") impacts.push("Rain - Wet operations protocols active");
    
    return impacts.length > 0 ? impacts : ["Normal operations - No weather impacts"];
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.intervalId = setInterval(() => this.simulate(), 5000);
      this.simulate();
    }
  }

  stop() {
    if (this.isRunning) {
      this.isRunning = false;
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }
  }
}

export const weatherSimulator = new WeatherSimulator();
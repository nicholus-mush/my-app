class VesselSimulator {
  constructor() {
    this.vessels = [];
    this.vesselId = 1;
    this.sizes = ["small", "medium", "large"];
    this.cargos = ["containers", "bulk", "oil", "general"];
    this.isRunning = false;
    this.vesselCount2h = 0;
    this.lastResetTime = new Date();
    this.nextResetTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
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
        console.error('Error in vessel data listener:', error);
      }
    });
  }
  estimateContainers(vesselData) {
  // Simple estimation based on vessel size and volume
    const baseEstimate = {
      small: 500,
      medium: 1500, 
      large: 4000
    };
  
    return Math.round(baseEstimate[vesselData.size] * (vesselData.volume / 50000));
 }

  generateVessel() {
    const size = this.sizes[Math.floor(Math.random() * this.sizes.length)];
    const cargo = this.cargos[Math.floor(Math.random() * this.cargos.length)];
    const volume = Math.floor(Math.random() * 49000) + 1000;
    
    const etaMinutes = Math.floor(Math.random() * 55) + 5;
    const eta = new Date(Date.now() + etaMinutes * 60000);
    
    const ataVariation = Math.floor(Math.random() * 21) - 10;
    const ata = new Date(eta.getTime() + ataVariation * 60000);
    
    const vessel = {
      id: `V${this.vesselId.toString().padStart(3, '0')}`,
      size,
      cargo,
      volume,
      eta: eta.toTimeString().slice(0, 5),
      ata: ata.toTimeString().slice(0, 5),
      latitude: parseFloat((Math.random() * 180 - 90).toFixed(6)),
      longitude: parseFloat((Math.random() * 360 - 180).toFixed(6)),
      speed: parseFloat((Math.random() * 20 + 5).toFixed(1)),
      heading: Math.floor(Math.random() * 360),
      timestamp: new Date().toISOString(),
      status: 'incoming',
      containers_loaded: Math.round(this.estimateContainers({size, volume}) * 0.3),
      containers_to_discharge: this.estimateContainers({size, volume}),
      docked_minutes: 0, // Track time at berth
      berth: null // Track assigned bert
      
      

    };
    
    this.vesselId++;
    return vessel;
  }


  checkResetCounter() {
    const currentTime = new Date();
    if (currentTime >= this.nextResetTime) {
      this.vesselCount2h = 0;
      this.lastResetTime = currentTime;
      this.nextResetTime = new Date(currentTime.getTime() + 2 * 60 * 60 * 1000);
    }
  }

  updateVesselPositions() {
    this.vessels.forEach(vessel => {
      if (vessel.status === 'incoming') {
        vessel.latitude = parseFloat((vessel.latitude + (Math.random() * 0.2 - 0.1)).toFixed(6));
        vessel.longitude = parseFloat((vessel.longitude + (Math.random() * 0.2 - 0.1)).toFixed(6));
        vessel.speed = parseFloat((Math.random() * 20 + 5).toFixed(1));
        vessel.heading = (vessel.heading + Math.floor(Math.random() * 21 - 10)) % 360;
        vessel.timestamp = new Date().toISOString();
        
        const currentTime = new Date();
        const [etaHours, etaMinutes] = vessel.eta.split(':').map(Number);
        const etaTime = new Date();
        etaTime.setHours(etaHours, etaMinutes, 0, 0);
        
        if (currentTime >= etaTime) {
          vessel.status = 'arrived';
        }
      }
    });
  }
  // Track vessel movements for historical data
  updateVesselStatus() {
    this.vessels.forEach(vessel => {
      if (vessel.status === 'arrived') {
        vessel.docked_minutes += 5; // Increment every simulation cycle (5 min)
        // Track in feature engine
        enhancedFeatureEngine.trackVesselMovement(vessel, 'docked');
      }
    });
}

  cleanupOldVessels() {
    const currentTime = new Date();
    this.vessels = this.vessels.filter(vessel => {
      if (vessel.status === 'arrived') {
        const vesselTime = new Date(vessel.timestamp);
        return currentTime - vesselTime <= 2 * 60 * 60 * 1000;
      }
      return true;
    });
  }

  simulate() {
    this.checkResetCounter();
    
    if (Math.random() < 0.5) {
      const newVessel = this.generateVessel();
      this.vessels.push(newVessel);
      this.vesselCount2h++;
    }
    
    this.updateVesselPositions();
    this.cleanupOldVessels();
    
    this.emitData({
      vessels: [...this.vessels],
      totalVessels: this.vessels.length,
      vesselCount2h: this.vesselCount2h,
      lastResetTime: this.lastResetTime.toISOString(),
      nextResetTime: this.nextResetTime.toISOString(),
      isRunning: this.isRunning,
      timestamp: new Date().toISOString()
    });
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.intervalId = setInterval(() => this.simulate(), 3000);
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

  resetCounter() {
    this.vesselCount2h = 0;
    this.lastResetTime = new Date();
    this.nextResetTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
    this.simulate();
  }
}

export const vesselSimulator = new VesselSimulator();
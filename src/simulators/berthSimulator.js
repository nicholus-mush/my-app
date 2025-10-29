class BerthSimulator {
  constructor() {
    this.berths = [];
    this.berthId = 1;
    this.statuses = ["available", "occupied", "maintenance"];
    this.vesselTypes = ["container", "bulk", "tanker", "general"];
    this.isRunning = false;
    this.intervalId = null;
    this.listeners = new Set();
    this.initializeBerths();
  }

  initializeBerths() {
    // Create 8 berths with different characteristics
    for (let i = 0; i < 8; i++) {
      this.berths.push({
        id: `B${this.berthId.toString().padStart(2, '0')}`,
        name: `Berth ${this.berthId}`,
        status: "available",
        maxVesselSize: ["small", "medium", "large"][i % 3],
        currentVessel: null,
        startTime: null,
        estimatedCompletion: null,
        utilization: 0,
        timestamp: new Date().toISOString()
      });
      this.berthId++;
    }
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
        console.error('Error in berth data listener:', error);
      }
    });
  }

  simulate() {
    this.berths.forEach(berth => {
      if (berth.status === "occupied" && berth.estimatedCompletion) {
        // Check if vessel has completed berthing
        if (new Date() >= new Date(berth.estimatedCompletion)) {
          berth.status = "available";
          berth.currentVessel = null;
          berth.startTime = null;
          berth.estimatedCompletion = null;
        }
      } else if (berth.status === "available" && Math.random() < 0.3) {
        // 30% chance to assign a vessel to available berth
        const vesselTypes = ["container", "bulk", "tanker", "general"];
        berth.status = "occupied";
        berth.currentVessel = `V${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`;
        berth.startTime = new Date().toISOString();
        
        // Random operation time between 2-8 hours
        const operationHours = 2 + Math.random() * 6;
        berth.estimatedCompletion = new Date(Date.now() + operationHours * 60 * 60 * 1000).toISOString();
      } else if (berth.status === "maintenance" && Math.random() < 0.1) {
        // 10% chance to complete maintenance
        berth.status = "available";
      } else if (berth.status === "available" && Math.random() < 0.05) {
        // 5% chance to go into maintenance
        berth.status = "maintenance";
      }

      // Update utilization statistics
      berth.utilization = berth.status === "occupied" ? 
        Math.min(100, (berth.utilization + Math.random() * 5)) : 
        Math.max(0, (berth.utilization - Math.random() * 3));
      
      berth.timestamp = new Date().toISOString();
    });

    this.emitData({
      berths: [...this.berths],
      totalBerths: this.berths.length,
      occupiedBerths: this.berths.filter(b => b.status === "occupied").length,
      availableBerths: this.berths.filter(b => b.status === "available").length,
      maintenanceBerths: this.berths.filter(b => b.status === "maintenance").length,
      overallUtilization: this.calculateOverallUtilization(),
      isRunning: this.isRunning,
      timestamp: new Date().toISOString()
    });
  }

  calculateOverallUtilization() {
    const occupied = this.berths.filter(b => b.status === "occupied").length;
    return Math.round((occupied / this.berths.length) * 100);
  }

  assignVessel(berthId, vesselId) {
    const berth = this.berths.find(b => b.id === berthId);
    if (berth && berth.status === "available") {
      berth.status = "occupied";
      berth.currentVessel = vesselId;
      berth.startTime = new Date().toISOString();
      berth.estimatedCompletion = new Date(Date.now() + (4 + Math.random() * 4) * 60 * 60 * 1000).toISOString();
      this.simulate();
      return true;
    }
    return false;
  }

  releaseBerth(berthId) {
    const berth = this.berths.find(b => b.id === berthId);
    if (berth && berth.status === "occupied") {
      berth.status = "available";
      berth.currentVessel = null;
      berth.startTime = null;
      berth.estimatedCompletion = null;
      this.simulate();
      return true;
    }
    return false;
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.intervalId = setInterval(() => this.simulate(), 4000);
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

export const berthSimulator = new BerthSimulator();
class CraneSimulator {
  constructor() {
    this.cranes = [];
    this.craneId = 1;
    this.statuses = ["operational", "maintenance", "idle"];
    this.isRunning = false;
    this.intervalId = null;
    this.listeners = new Set();
    this.initializeCranes();
  }

  initializeCranes() {
    // Create 12 cranes with different types
    const types = ["STS", "RTG", "RMG", "Mobile"];
    for (let i = 0; i < 12; i++) {
      this.cranes.push({
        id: `C${this.craneId.toString().padStart(2, '0')}`,
        name: `Crane ${this.craneId}`,
        type: types[i % 4],
        status: "idle",
        currentVessel: null,
        movesPerHour: Math.floor(Math.random() * 30) + 20,
        totalMoves: 0,
        utilization: 0,
        lastMaintenance: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        timestamp: new Date().toISOString()
      });
      this.craneId++;
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
        console.error('Error in crane data listener:', error);
      }
    });
  }

  simulate() {
    this.cranes.forEach(crane => {
      if (crane.status === "operational" && crane.currentVessel) {
        // Simulate container moves
        const movesThisCycle = Math.floor(Math.random() * crane.movesPerHour / 12); // 5-minute cycles
        crane.totalMoves += movesThisCycle;
        crane.utilization = Math.min(100, crane.utilization + Math.random() * 10);
        
        // Random chance to complete operation
        if (Math.random() < 0.1) {
          crane.status = "idle";
          crane.currentVessel = null;
          crane.utilization = 0;
        }
      } else if (crane.status === "idle" && Math.random() < 0.4) {
        // 40% chance to assign to a vessel
        crane.status = "operational";
        crane.currentVessel = `V${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`;
      } else if (crane.status === "operational" && Math.random() < 0.02) {
        // 2% chance to require maintenance
        crane.status = "maintenance";
        crane.currentVessel = null;
      } else if (crane.status === "maintenance" && Math.random() < 0.3) {
        // 30% chance to complete maintenance
        crane.status = "idle";
        crane.lastMaintenance = new Date().toISOString();
      }

      crane.timestamp = new Date().toISOString();
    });

    this.emitData({
      cranes: [...this.cranes],
      totalCranes: this.cranes.length,
      operationalCranes: this.cranes.filter(c => c.status === "operational").length,
      idleCranes: this.cranes.filter(c => c.status === "idle").length,
      maintenanceCranes: this.cranes.filter(c => c.status === "maintenance").length,
      totalMoves: this.cranes.reduce((sum, crane) => sum + crane.totalMoves, 0),
      averageUtilization: this.calculateAverageUtilization(),
      isRunning: this.isRunning,
      timestamp: new Date().toISOString()
    });
  }

  calculateAverageUtilization() {
    const operationalCranes = this.cranes.filter(c => c.status === "operational");
    if (operationalCranes.length === 0) return 0;
    
    const totalUtilization = operationalCranes.reduce((sum, crane) => sum + crane.utilization, 0);
    return Math.round(totalUtilization / operationalCranes.length);
  }

  assignCrane(craneId, vesselId) {
    const crane = this.cranes.find(c => c.id === craneId);
    if (crane && (crane.status === "idle" || crane.status === "operational")) {
      crane.status = "operational";
      crane.currentVessel = vesselId;
      this.simulate();
      return true;
    }
    return false;
  }

  setMaintenance(craneId) {
    const crane = this.cranes.find(c => c.id === craneId);
    if (crane) {
      crane.status = "maintenance";
      crane.currentVessel = null;
      this.simulate();
      return true;
    }
    return false;
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

export const craneSimulator = new CraneSimulator();
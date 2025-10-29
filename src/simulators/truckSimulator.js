class TruckSimulator {
  constructor() {
    this.trucks = [];
    this.truckId = 1;
    this.statuses = ["loading", "unloading", "traveling", "waiting", "maintenance"];
    this.isRunning = false;
    this.intervalId = null;
    this.listeners = new Set();
    this.initializeTrucks();
  }

  initializeTrucks() {
    // Create 25 trucks
    for (let i = 0; i < 25; i++) {
      this.trucks.push({
        id: `T${this.truckId.toString().padStart(3, '0')}`,
        licensePlate: `TRK-${Math.floor(1000 + Math.random() * 9000)}`,
        status: "waiting",
        currentLocation: "Yard",
        destination: null,
        container: null,
        tripsCompleted: 0,
        utilization: 0,
        lastMaintenance: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        timestamp: new Date().toISOString()
      });
      this.truckId++;
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
        console.error('Error in truck data listener:', error);
      }
    });
  }

  simulate() {
    this.trucks.forEach(truck => {
      if (truck.status === "traveling" && Math.random() < 0.3) {
        // 30% chance to complete travel
        truck.status = Math.random() < 0.5 ? "loading" : "unloading";
        truck.currentLocation = truck.destination;
        truck.destination = null;
      } else if ((truck.status === "loading" || truck.status === "unloading") && Math.random() < 0.4) {
        // 40% chance to complete loading/unloading
        if (truck.status === "loading") {
          truck.container = `CNTR-${Math.floor(100000 + Math.random() * 900000)}`;
          truck.status = "traveling";
          truck.destination = "Gate";
        } else {
          truck.container = null;
          truck.status = "traveling";
          truck.destination = "Yard";
          truck.tripsCompleted++;
        }
      } else if (truck.status === "waiting" && Math.random() < 0.2) {
        // 20% chance to start a job
        truck.status = Math.random() < 0.5 ? "loading" : "traveling";
        truck.destination = Math.random() < 0.5 ? "Berth" : "Gate";
      } else if (truck.status !== "maintenance" && Math.random() < 0.01) {
        // 1% chance to require maintenance
        truck.status = "maintenance";
        truck.container = null;
        truck.destination = null;
      } else if (truck.status === "maintenance" && Math.random() < 0.2) {
        // 20% chance to complete maintenance
        truck.status = "waiting";
        truck.lastMaintenance = new Date().toISOString();
      }

      // Update utilization
      if (truck.status !== "waiting" && truck.status !== "maintenance") {
        truck.utilization = Math.min(100, truck.utilization + Math.random() * 5);
      } else {
        truck.utilization = Math.max(0, truck.utilization - Math.random() * 2);
      }

      truck.timestamp = new Date().toISOString();
    });

    this.emitData({
      trucks: [...this.trucks],
      totalTrucks: this.trucks.length,
      activeTrucks: this.trucks.filter(t => t.status !== "waiting" && t.status !== "maintenance").length,
      waitingTrucks: this.trucks.filter(t => t.status === "waiting").length,
      maintenanceTrucks: this.trucks.filter(t => t.status === "maintenance").length,
      totalTrips: this.trucks.reduce((sum, truck) => sum + truck.tripsCompleted, 0),
      averageUtilization: this.calculateAverageUtilization(),
      isRunning: this.isRunning,
      timestamp: new Date().toISOString()
    });
  }

  calculateAverageUtilization() {
    const activeTrucks = this.trucks.filter(t => t.status !== "maintenance");
    if (activeTrucks.length === 0) return 0;
    
    const totalUtilization = activeTrucks.reduce((sum, truck) => sum + truck.utilization, 0);
    return Math.round(totalUtilization / activeTrucks.length);
  }

  assignJob(truckId, jobType) {
    const truck = this.trucks.find(t => t.id === truckId);
    if (truck && truck.status === "waiting") {
      truck.status = "traveling";
      truck.destination = jobType === "export" ? "Berth" : "Gate";
      this.simulate();
      return true;
    }
    return false;
  }

  setMaintenance(truckId) {
    const truck = this.trucks.find(t => t.id === truckId);
    if (truck) {
      truck.status = "maintenance";
      truck.container = null;
      truck.destination = null;
      this.simulate();
      return true;
    }
    return false;
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
}

export const truckSimulator = new TruckSimulator();
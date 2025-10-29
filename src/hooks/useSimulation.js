import { useState, useEffect } from 'react';

const useSimulation = (simulator, autoStart = false) => {
  const [simulationData, setSimulationData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const handleData = (data) => {
      setSimulationData(data);
      setIsConnected(true);
    };

    const unsubscribe = simulator.onData(handleData);

    if (autoStart && !simulator.isRunning) {
      simulator.start();
    }

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [simulator, autoStart]);

  const startSimulation = () => simulator.start();
  const stopSimulation = () => simulator.stop();
  
  // Special methods for specific simulators
  const resetCounter = () => {
    if (simulator.resetCounter) simulator.resetCounter();
  };
  
  const assignVessel = (berthId, vesselId) => {
    if (simulator.assignVessel) return simulator.assignVessel(berthId, vesselId);
    return false;
  };

  const assignCrane = (craneId, vesselId) => {
    if (simulator.assignCrane) return simulator.assignCrane(craneId, vesselId);
    return false;
  };

  const assignJob = (truckId, jobType) => {
    if (simulator.assignJob) return simulator.assignJob(truckId, jobType);
    return false;
  };

  return {
    data: simulationData,
    isConnected,
    isRunning: simulator.isRunning,
    startSimulation,
    stopSimulation,
    resetCounter,
    assignVessel,
    assignCrane,
    assignJob
  };
};

export default useSimulation;
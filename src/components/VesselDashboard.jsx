import React from 'react';
import useSimulation from '../hooks/useSimulation';
import { vesselSimulator } from '../simulators/vesselSimulator';

const VesselDashboard = () => {
  const { 
    data, 
    isConnected, 
    isRunning, 
    startSimulation, 
    stopSimulation, 
    resetCounter 
  } = useSimulation(vesselSimulator, false);

  const getStatusColor = (status) => {
    return status === 'incoming' 
      ? 'text-yellow-500 bg-yellow-50'
      : 'text-green-500 bg-green-50';
  };

  const getSizeColor = (size) => {
    switch (size) {
      case 'small': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'large': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="text-6xl mb-4">🌊</div>
            <h2 className="text-2xl font-bold mb-4">Vessel Tracking System</h2>
            <p className="text-gray-400 mb-6">Ready to start simulation</p>
            <button
              onClick={startSimulation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-mono transition-colors"
            >
              START SIMULATION
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-mono font-bold text-green-400">VESSEL CONTROL SYSTEM</h1>
            <div className="flex gap-4">
              <button
                onClick={startSimulation}
                disabled={isRunning}
                className={`px-4 py-2 rounded font-mono text-sm transition-colors ${
                  isRunning 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                START
              </button>
              <button
                onClick={stopSimulation}
                disabled={!isRunning}
                className={`px-4 py-2 rounded font-mono text-sm transition-colors ${
                  !isRunning 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                STOP
              </button>
              <button
                onClick={resetCounter}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-mono text-sm transition-colors"
              >
                RESET COUNTER
              </button>
            </div>
          </div>

          {/* Status Bar */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <div className="text-gray-400 font-mono text-sm">TOTAL VESSELS</div>
              <div className="text-2xl font-mono text-green-400">{data.totalVessels}</div>
            </div>
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <div className="text-gray-400 font-mono text-sm">2H COUNT</div>
              <div className="text-2xl font-mono text-yellow-400">{data.vesselCount2h}</div>
            </div>
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <div className="text-gray-400 font-mono text-sm">STATUS</div>
              <div className={`text-lg font-mono ${isRunning ? 'text-green-400' : 'text-red-400'}`}>
                {isRunning ? 'ACTIVE' : 'STANDBY'}
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <div className="text-gray-400 font-mono text-sm">NEXT RESET</div>
              <div className="text-sm font-mono text-blue-400">
                {new Date(data.nextResetTime).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Vessels Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 bg-gray-700 border-b border-gray-600">
            <h2 className="text-xl font-mono font-bold">ACTIVE VESSELS - {data.totalVessels}</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-750 border-b border-gray-600">
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">VESSEL ID</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">SIZE</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">CARGO</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">VOLUME</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">ETA</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">ATA</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">POSITION</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">SPEED</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">HEADING</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {data.vessels.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-8 text-center text-gray-400 font-mono">
                      NO VESSELS IN RANGE
                    </td>
                  </tr>
                ) : (
                  data.vessels.map((vessel) => (
                    <tr key={vessel.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 font-mono text-green-400">{vessel.id}</td>
                      <td className={`px-6 py-4 font-mono font-bold ${getSizeColor(vessel.size)}`}>
                        {vessel.size.toUpperCase()}
                      </td>
                      <td className="px-6 py-4 font-mono">{vessel.cargo.toUpperCase()}</td>
                      <td className="px-6 py-4 font-mono">{vessel.volume.toLocaleString()} T</td>
                      <td className="px-6 py-4 font-mono text-yellow-400">{vessel.eta}</td>
                      <td className="px-6 py-4 font-mono text-blue-400">{vessel.ata}</td>
                      <td className="px-6 py-4 font-mono text-xs">
                        {vessel.latitude.toFixed(4)}, {vessel.longitude.toFixed(4)}
                      </td>
                      <td className="px-6 py-4 font-mono">{vessel.speed} KTS</td>
                      <td className="px-6 py-4 font-mono">{vessel.heading}°</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-mono font-bold ${getStatusColor(vessel.status)}`}>
                          {vessel.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-gray-500 font-mono text-sm">
          LAST UPDATE: {new Date(data.timestamp).toLocaleTimeString()} | 
          CONNECTION: <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
            {isConnected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VesselDashboard;
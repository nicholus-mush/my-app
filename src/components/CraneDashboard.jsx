import React from 'react';
import useSimulation from '../hooks/useSimulation';
import { craneSimulator } from '../simulators/craneSimulator';

const CraneDashboard = () => {
  const { 
    data, 
    isConnected, 
    isRunning, 
    startSimulation, 
    stopSimulation 
  } = useSimulation(craneSimulator, false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'text-green-500 bg-green-50';
      case 'idle': return 'text-yellow-500 bg-yellow-50';
      case 'maintenance': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'STS': return 'text-purple-400';
      case 'RTG': return 'text-blue-400';
      case 'RMG': return 'text-green-400';
      case 'Mobile': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="text-6xl mb-4">🏗️</div>
            <h2 className="text-2xl font-bold mb-4">Crane Management System</h2>
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
            <h1 className="text-3xl font-mono font-bold text-yellow-400">CRANE CONTROL SYSTEM</h1>
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
            </div>
          </div>

          {/* Status Bar */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <div className="text-gray-400 font-mono text-sm">TOTAL CRANES</div>
              <div className="text-2xl font-mono text-yellow-400">{data.totalCranes}</div>
            </div>
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <div className="text-gray-400 font-mono text-sm">OPERATIONAL</div>
              <div className="text-2xl font-mono text-green-400">{data.operationalCranes}</div>
            </div>
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <div className="text-gray-400 font-mono text-sm">TOTAL MOVES</div>
              <div className="text-2xl font-mono text-blue-400">{data.totalMoves}</div>
            </div>
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <div className="text-gray-400 font-mono text-sm">AVG UTILIZATION</div>
              <div className="text-2xl font-mono text-purple-400">{data.averageUtilization}%</div>
            </div>
          </div>
        </div>

        {/* Cranes Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 bg-gray-700 border-b border-gray-600">
            <h2 className="text-xl font-mono font-bold">CRANE FLEET STATUS - {data.totalCranes} UNITS</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-750 border-b border-gray-600">
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">CRANE ID</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">NAME</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">TYPE</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">STATUS</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">VESSEL</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">MOVES/HOUR</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">TOTAL MOVES</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">UTILIZATION</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">LAST MAINT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {data.cranes.map((crane) => (
                  <tr key={crane.id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 font-mono text-yellow-400">{crane.id}</td>
                    <td className="px-6 py-4 font-mono">{crane.name}</td>
                    <td className={`px-6 py-4 font-mono font-bold ${getTypeColor(crane.type)}`}>
                      {crane.type}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-mono font-bold ${getStatusColor(crane.status)}`}>
                        {crane.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono">
                      {crane.currentVessel ? (
                        <span className="text-green-400">{crane.currentVessel}</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-center">{crane.movesPerHour}</td>
                    <td className="px-6 py-4 font-mono text-center">{crane.totalMoves}</td>
                    <td className="px-6 py-4 font-mono">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${crane.utilization}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{Math.round(crane.utilization)}%</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">
                      {new Date(crane.lastMaintenance).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-gray-500 font-mono text-sm">
          LAST UPDATE: {new Date(data.timestamp).toLocaleTimeString()} | 
          IDLE: {data.idleCranes} | MAINTENANCE: {data.maintenanceCranes}
        </div>
      </div>
    </div>
  );
};

export default CraneDashboard;
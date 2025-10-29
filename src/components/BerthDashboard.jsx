import React from 'react';
import useSimulation from '../hooks/useSimulation';
import { berthSimulator } from '../simulators/berthSimulator';

const BerthDashboard = () => {
  const { 
    data, 
    isConnected, 
    isRunning, 
    startSimulation, 
    stopSimulation 
  } = useSimulation(berthSimulator, false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'text-green-500 bg-green-50';
      case 'occupied': return 'text-yellow-500 bg-yellow-50';
      case 'maintenance': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const formatTimeRemaining = (completionTime) => {
    if (!completionTime) return 'N/A';
    const remaining = new Date(completionTime) - new Date();
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="text-6xl mb-4">⚓</div>
            <h2 className="text-2xl font-bold mb-4">Berth Management System</h2>
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
            <h1 className="text-3xl font-mono font-bold text-blue-400">BERTH CONTROL SYSTEM</h1>
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
              <div className="text-gray-400 font-mono text-sm">TOTAL BERTHS</div>
              <div className="text-2xl font-mono text-blue-400">{data.totalBerths}</div>
            </div>
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <div className="text-gray-400 font-mono text-sm">OCCUPIED</div>
              <div className="text-2xl font-mono text-yellow-400">{data.occupiedBerths}</div>
            </div>
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <div className="text-gray-400 font-mono text-sm">AVAILABLE</div>
              <div className="text-2xl font-mono text-green-400">{data.availableBerths}</div>
            </div>
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <div className="text-gray-400 font-mono text-sm">UTILIZATION</div>
              <div className="text-2xl font-mono text-purple-400">{data.overallUtilization}%</div>
            </div>
          </div>
        </div>

        {/* Berths Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 bg-gray-700 border-b border-gray-600">
            <h2 className="text-xl font-mono font-bold">BERTH STATUS - {data.totalBerths} BERTHS</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-750 border-b border-gray-600">
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">BERTH ID</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">NAME</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">MAX SIZE</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">STATUS</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">VESSEL</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">START TIME</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">TIME REMAINING</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">UTILIZATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {data.berths.map((berth) => (
                  <tr key={berth.id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 font-mono text-blue-400">{berth.id}</td>
                    <td className="px-6 py-4 font-mono">{berth.name}</td>
                    <td className="px-6 py-4 font-mono font-bold text-yellow-400">
                      {berth.maxVesselSize.toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-mono font-bold ${getStatusColor(berth.status)}`}>
                        {berth.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono">
                      {berth.currentVessel ? (
                        <span className="text-green-400">{berth.currentVessel}</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">
                      {berth.startTime ? new Date(berth.startTime).toLocaleTimeString() : '-'}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">
                      {berth.estimatedCompletion ? (
                        <span className="text-yellow-400">{formatTimeRemaining(berth.estimatedCompletion)}</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${berth.utilization}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{Math.round(berth.utilization)}%</div>
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
          MAINTENANCE: {data.maintenanceBerths} BERTHS
        </div>
      </div>
    </div>
  );
};

export default BerthDashboard;
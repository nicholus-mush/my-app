import React from 'react';
import useSimulation from '../hooks/useSimulation';
import { truckSimulator } from '../simulators/truckSimulator';

const TruckDashboard = () => {
  const { 
    data, 
    isConnected, 
    isRunning, 
    startSimulation, 
    stopSimulation 
  } = useSimulation(truckSimulator, false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'loading': return 'text-blue-500 bg-blue-50';
      case 'unloading': return 'text-purple-500 bg-purple-50';
      case 'traveling': return 'text-yellow-500 bg-yellow-50';
      case 'waiting': return 'text-gray-500 bg-gray-50';
      case 'maintenance': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="text-6xl mb-4">🚛</div>
            <h2 className="text-2xl font-bold mb-4">Truck Management System</h2>
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
            <h1 className="text-3xl font-mono font-bold text-orange-400">TRUCK CONTROL SYSTEM</h1>
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
              <div className="text-gray-400 font-mono text-sm">TOTAL TRUCKS</div>
              <div className="text-2xl font-mono text-orange-400">{data.totalTrucks}</div>
            </div>
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <div className="text-gray-400 font-mono text-sm">ACTIVE</div>
              <div className="text-2xl font-mono text-green-400">{data.activeTrucks}</div>
            </div>
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <div className="text-gray-400 font-mono text-sm">TOTAL TRIPS</div>
              <div className="text-2xl font-mono text-blue-400">{data.totalTrips}</div>
            </div>
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <div className="text-gray-400 font-mono text-sm">AVG UTILIZATION</div>
              <div className="text-2xl font-mono text-purple-400">{data.averageUtilization}%</div>
            </div>
          </div>
        </div>

        {/* Trucks Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 bg-gray-700 border-b border-gray-600">
            <h2 className="text-xl font-mono font-bold">TRUCK FLEET STATUS - {data.totalTrucks} UNITS</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-750 border-b border-gray-600">
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">TRUCK ID</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">LICENSE</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">STATUS</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">LOCATION</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">DESTINATION</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">CONTAINER</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">TRIPS</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">UTILIZATION</th>
                  <th className="px-6 py-3 text-left font-mono text-sm font-bold text-gray-300">LAST MAINT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {data.trucks.map((truck) => (
                  <tr key={truck.id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 font-mono text-orange-400">{truck.id}</td>
                    <td className="px-6 py-4 font-mono text-sm">{truck.licensePlate}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-mono font-bold ${getStatusColor(truck.status)}`}>
                        {truck.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono">{truck.currentLocation}</td>
                    <td className="px-6 py-4 font-mono">
                      {truck.destination ? (
                        <span className="text-yellow-400">{truck.destination}</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">
                      {truck.container ? (
                        <span className="text-green-400">{truck.container}</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-center">{truck.tripsCompleted}</td>
                    <td className="px-6 py-4 font-mono">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${truck.utilization}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{Math.round(truck.utilization)}%</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">
                      {new Date(truck.lastMaintenance).toLocaleDateString()}
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
          WAITING: {data.waitingTrucks} | MAINTENANCE: {data.maintenanceTrucks}
        </div>
      </div>
    </div>
  );
};

export default TruckDashboard;
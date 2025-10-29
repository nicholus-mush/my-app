import React, { useState } from 'react';

const SystemOperations = ({ onSystemSelect, isOperationsStarted, onStartOperations, onStopOperations }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-mono font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            PORT OPERATIONS CONTROL
          </h1>
          <p className="text-xl text-gray-400 font-mono">REAL-TIME SIMULATION SYSTEM</p>
          
          {/* Operations Control */}
          <div className="mt-6 flex justify-center gap-4">
            {!isOperationsStarted ? (
              <button
                onClick={onStartOperations}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-mono font-bold transition-colors flex items-center gap-2"
              >
                🚀 START ALL OPERATIONS
              </button>
            ) : (
              <button
                onClick={onStopOperations}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-mono font-bold transition-colors flex items-center gap-2"
              >
                🛑 STOP ALL OPERATIONS
              </button>
            )}
          </div>
        </div>

        {/* System Status Grid - Clickable Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {/* Vessel Tracking Card */}
          <div 
            onClick={() => isOperationsStarted && onSystemSelect('vessels')}
            className={`bg-gray-800 p-6 rounded-lg border-2 text-center cursor-pointer transition-all duration-200 ${
              isOperationsStarted 
                ? 'border-green-500 hover:border-green-400 hover:scale-105 hover:shadow-2xl' 
                : 'border-gray-600 cursor-not-allowed opacity-60'
            }`}
          >
            <div className="text-4xl mb-2">🚢</div>
            <div className="font-mono text-green-400 font-bold mb-2">VESSEL TRACKING</div>
            <div className="text-gray-400 text-sm mb-3">Real-time vessel monitoring</div>
            <div className={`text-xs font-mono px-2 py-1 rounded ${
              isOperationsStarted ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'
            }`}>
              {isOperationsStarted ? 'CLICK TO VIEW →' : 'START OPERATIONS FIRST'}
            </div>
          </div>

          {/* Berth Management Card */}
          <div 
            onClick={() => isOperationsStarted && onSystemSelect('berths')}
            className={`bg-gray-800 p-6 rounded-lg border-2 text-center cursor-pointer transition-all duration-200 ${
              isOperationsStarted 
                ? 'border-blue-500 hover:border-blue-400 hover:scale-105 hover:shadow-2xl' 
                : 'border-gray-600 cursor-not-allowed opacity-60'
            }`}
          >
            <div className="text-4xl mb-2">⚓</div>
            <div className="font-mono text-blue-400 font-bold mb-2">BERTH MANAGEMENT</div>
            <div className="text-gray-400 text-sm mb-3">Berth allocation & utilization</div>
            <div className={`text-xs font-mono px-2 py-1 rounded ${
              isOperationsStarted ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-400'
            }`}>
              {isOperationsStarted ? 'CLICK TO VIEW →' : 'START OPERATIONS FIRST'}
            </div>
          </div>

          {/* Crane Operations Card */}
          <div 
            onClick={() => isOperationsStarted && onSystemSelect('cranes')}
            className={`bg-gray-800 p-6 rounded-lg border-2 text-center cursor-pointer transition-all duration-200 ${
              isOperationsStarted 
                ? 'border-yellow-500 hover:border-yellow-400 hover:scale-105 hover:shadow-2xl' 
                : 'border-gray-600 cursor-not-allowed opacity-60'
            }`}
          >
            <div className="text-4xl mb-2">🏗️</div>
            <div className="font-mono text-yellow-400 font-bold mb-2">CRANE OPERATIONS</div>
            <div className="text-gray-400 text-sm mb-3">Crane fleet monitoring</div>
            <div className={`text-xs font-mono px-2 py-1 rounded ${
              isOperationsStarted ? 'bg-yellow-900 text-yellow-300' : 'bg-gray-700 text-gray-400'
            }`}>
              {isOperationsStarted ? 'CLICK TO VIEW →' : 'START OPERATIONS FIRST'}
            </div>
          </div>

          {/* Truck Fleet Card */}
          <div 
            onClick={() => isOperationsStarted && onSystemSelect('trucks')}
            className={`bg-gray-800 p-6 rounded-lg border-2 text-center cursor-pointer transition-all duration-200 ${
              isOperationsStarted 
                ? 'border-orange-500 hover:border-orange-400 hover:scale-105 hover:shadow-2xl' 
                : 'border-gray-600 cursor-not-allowed opacity-60'
            }`}
          >
            <div className="text-4xl mb-2">🚛</div>
            <div className="font-mono text-orange-400 font-bold mb-2">TRUCK FLEET</div>
            <div className="text-gray-400 text-sm mb-3">Container movement tracking</div>
            <div className={`text-xs font-mono px-2 py-1 rounded ${
              isOperationsStarted ? 'bg-orange-900 text-orange-300' : 'bg-gray-700 text-gray-400'
            }`}>
              {isOperationsStarted ? 'CLICK TO VIEW →' : 'START OPERATIONS FIRST'}
            </div>
          </div>

          {/* Weather Monitoring Card */}
          <div 
            onClick={() => isOperationsStarted && onSystemSelect('weather')}
            className={`bg-gray-800 p-6 rounded-lg border-2 text-center cursor-pointer transition-all duration-200 ${
              isOperationsStarted 
                ? 'border-cyan-500 hover:border-cyan-400 hover:scale-105 hover:shadow-2xl' 
                : 'border-gray-600 cursor-not-allowed opacity-60'
            }`}
          >
            <div className="text-4xl mb-2">🌤️</div>
            <div className="font-mono text-cyan-400 font-bold mb-2">WEATHER MONITORING</div>
            <div className="text-gray-400 text-sm mb-3">Real-time weather data</div>
            <div className={`text-xs font-mono px-2 py-1 rounded ${
              isOperationsStarted ? 'bg-cyan-900 text-cyan-300' : 'bg-gray-700 text-gray-400'
            }`}>
              {isOperationsStarted ? 'CLICK TO VIEW →' : 'START OPERATIONS FIRST'}
            </div>
          </div>

          {/* Analytics Card */}
          <div 
            onClick={() => isOperationsStarted && onSystemSelect('analytics-hub')}
            className={`bg-gray-800 p-6 rounded-lg border-2 text-center cursor-pointer transition-all duration-200 ${
              isOperationsStarted 
                ? 'border-purple-500 hover:border-purple-400 hover:scale-105 hover:shadow-2xl' 
                : 'border-gray-600 cursor-not-allowed opacity-60'
            }`}
          >
            <div className="text-4xl mb-2">📊</div>
            <div className="font-mono text-purple-400 font-bold mb-2">ANALYTICS HUB</div>
            <div className="text-gray-400 text-sm mb-3">Performance metrics</div>
            <div className={`text-xs font-mono px-2 py-1 rounded ${
              isOperationsStarted ? 'bg-purple-900 text-purple-300' : 'bg-gray-700 text-gray-400'
            }`}>
              {isOperationsStarted ? 'CHOOSE ANALYTICS VIEW  →' : 'START OPERATIONS FIRST'}
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center px-4 py-2 rounded-full font-mono text-sm ${
            isOperationsStarted 
              ? 'bg-green-900 text-green-300 border border-green-700' 
              : 'bg-gray-800 text-gray-400 border border-gray-700'
          }`}>
            <div className={`w-3 h-3 rounded-full mr-2 ${
              isOperationsStarted ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
            }`}></div>
            SYSTEM STATUS: {isOperationsStarted ? 'OPERATIONS ACTIVE' : 'STANDBY MODE'}
          </div>
        </div>

        {/* Quick Stats (when operations are active) */}
        {isOperationsStarted && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
            <h2 className="text-xl font-mono font-bold text-center mb-4 text-green-400">
              LIVE OPERATIONS DASHBOARD
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl mb-1">🚢</div>
                <div className="font-mono text-sm text-gray-400">Vessels</div>
                <div className="font-mono text-lg text-green-400">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">⚓</div>
                <div className="font-mono text-sm text-gray-400">Berths</div>
                <div className="font-mono text-lg text-blue-400">Monitoring</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🏗️</div>
                <div className="font-mono text-sm text-gray-400">Cranes</div>
                <div className="font-mono text-lg text-yellow-400">Operational</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🚛</div>
                <div className="font-mono text-sm text-gray-400">Trucks</div>
                <div className="font-mono text-lg text-orange-400">Moving</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🌤️</div>
                <div className="font-mono text-sm text-gray-400">Weather</div>
                <div className="font-mono text-lg text-cyan-400">Live</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">📊</div>
                <div className="font-mono text-sm text-gray-400">Analytics</div>
                <div className="font-mono text-lg text-purple-400">Streaming</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 font-mono text-sm">
          PORT OPERATIONS SIMULATION SYSTEM v3.0 | {isOperationsStarted ? 'LIVE DATA STREAMS' : 'READY FOR ACTIVATION'}
        </div>
      </div>
    </div>
  );
};

export default SystemOperations;
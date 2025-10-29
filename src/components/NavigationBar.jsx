import React from 'react';

const NavigationBar = ({ 
  currentView, 
  onNavigate, 
  isOperationsStarted, 
  onStartOperations, 
  onStopOperations,
  onGoHome 
}) => {
  // Don't show nav bar on main page
  if (currentView === 'main') return null;

  // Show different back button based on current view
  const getBackButton = () => {
    if (currentView.startsWith('analytics-')) {
      return (
        <button
          onClick={() => onNavigate('analytics-hub')}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-mono text-sm transition-colors flex items-center gap-2"
        >
          ← BACK TO ANALYTICS HUB
        </button>
      );
    } else if (currentView === 'analytics-hub') {
      return (
        <button
          onClick={onGoHome}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-mono text-sm transition-colors flex items-center gap-2"
        >
          ← BACK TO CONTROL CENTER
        </button>
      );
    } else {
      return (
        <button
          onClick={onGoHome}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-mono text-sm transition-colors flex items-center gap-2"
        >
          ← BACK TO CONTROL CENTER
        </button>
      );
    }
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Dynamic Back Button */}
        {getBackButton()}
        
        {/* System Navigation Menu */}
        <div className="flex gap-2">
          <button
            onClick={() => onNavigate('vessels')}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
              currentView === 'vessels' 
                ? 'bg-green-600 text-white border border-green-500' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:border-green-500'
            }`}
          >
            <span>🚢</span>
            VESSELS
          </button>
          <button
            onClick={() => onNavigate('berths')}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
              currentView === 'berths' 
                ? 'bg-blue-600 text-white border border-blue-500' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:border-blue-500'
            }`}
          >
            <span>⚓</span>
            BERTHS
          </button>
          <button
            onClick={() => onNavigate('cranes')}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
              currentView === 'cranes' 
                ? 'bg-yellow-600 text-white border border-yellow-500' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:border-yellow-500'
            }`}
          >
            <span>🏗️</span>
            CRANES
          </button>
          <button
            onClick={() => onNavigate('trucks')}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
              currentView === 'trucks' 
                ? 'bg-orange-600 text-white border border-orange-500' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:border-orange-500'
            }`}
          >
            <span>🚛</span>
            TRUCKS
          </button>
          <button
            onClick={() => onNavigate('weather')}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
              currentView === 'weather' 
                ? 'bg-cyan-600 text-white border border-cyan-500' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:border-cyan-500'
            }`}
          >
            <span>🌤️</span>
            WEATHER
          </button>
          <button
            onClick={() => onNavigate('analytics-hub')}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
              currentView.startsWith('analytics') 
                ? 'bg-purple-600 text-white border border-purple-500' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:border-purple-500'
            }`}
          >
            <span>📊</span>
            ANALYTICS
          </button>
        </div>

        {/* Operations Control in Nav */}
        <div className="flex gap-2">
          {isOperationsStarted ? (
            <button
              onClick={onStopOperations}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1"
            >
              🛑 STOP OPS
            </button>
          ) : (
            <button
              onClick={onStartOperations}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1"
            >
              🚀 START OPS
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;
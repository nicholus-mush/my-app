import React, { useState } from 'react';
import VesselDashboard from './components/VesselDashboard';
import BerthDashboard from './components/BerthDashboard';
import CraneDashboard from './components/CraneDashboard';
import TruckDashboard from './components/TruckDashboard';
import WeatherDashboard from './components/WeatherDashboard';
import SystemOperations from './components/SystemOperations';
import NavigationBar from './components/NavigationBar';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import EnhancedAnalyticsDashboard from './components/EnhancedAnalyticsDashboard';
import AnalyticsHub from './components/AnalyticsHub'; // ADD THIS IMPORT
import PredictiveAnalytics from './components/PredictiveAnalytics'; 
import ModelIntegration from './components/ModelIntegration';
import LiveModelIntegration from './components/LiveModelIntegration';
function App() {
  const [currentView, setCurrentView] = useState('main');
  const [isOperationsStarted, setIsOperationsStarted] = useState(false);

  const startAllOperations = () => {
    setIsOperationsStarted(true);
    console.log("🚀 All port operations started!");
  };

  const stopAllOperations = () => {
    setIsOperationsStarted(false);
    console.log("🛑 All port operations stopped!");
  };

  const handleSystemSelect = (system) => {
    setCurrentView(system);
  };

  const handleGoHome = () => {
    setCurrentView('main');
  };

  const handleAnalyticsSelect = (analyticsType) => {
    setCurrentView(`analytics-${analyticsType}`);
  };

  const renderView = () => {
    switch (currentView) {
      case 'vessels':
        return <VesselDashboard />;
      case 'berths':
        return <BerthDashboard />;
      case 'cranes':
        return <CraneDashboard />;
      case 'trucks':
        return <TruckDashboard />;
      case 'weather':
        return <WeatherDashboard />;
      case 'analytics-hub': // NEW: Analytics Hub
        return <AnalyticsHub onSelectAnalytics={handleAnalyticsSelect} onBack={handleGoHome} />;
      case 'analytics-standard': // NEW: Standard Analytics
        return <AnalyticsDashboard onBack={() => setCurrentView('analytics-hub')} />;
      case 'analytics-enhanced': // NEW: Enhanced Analytics
        return <EnhancedAnalyticsDashboard onBack={() => setCurrentView('analytics-hub')} />;
      case 'analytics-predictive':
        return <PredictiveAnalytics onBack={() => setCurrentView('analytics-hub')} />;
      case 'analytics-model-integration': 
        return <ModelIntegration  onBack={() => setCurrentState('analytics-hub')}/>;
      case 'analytics-live-model-integration': 
        return <LiveModelIntegration onBack={() => setCurrentView('analytics-hub')} />;
      case 'main':
      default:
        return (
          <SystemOperations 
            onSystemSelect={handleSystemSelect}
            isOperationsStarted={isOperationsStarted}
            onStartOperations={startAllOperations}
            onStopOperations={stopAllOperations}
          />
        );
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen">
      <NavigationBar 
        currentView={currentView}
        onNavigate={setCurrentView}
        isOperationsStarted={isOperationsStarted}
        onStartOperations={startAllOperations}
        onStopOperations={stopAllOperations}
        onGoHome={handleGoHome}
      />
      {renderView()}
    </div>
  );
}

export default App;
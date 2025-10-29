import React from 'react';

const AnalyticsHub = ({ onSelectAnalytics, onBack }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <button
            onClick={onBack}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-mono text-sm transition-colors flex items-center gap-2 mb-6"
          >
            ← BACK TO CONTROL CENTER
          </button>
          <h1 className="text-4xl font-mono font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            ANALYTICS HUB
          </h1>
          <p className="text-xl text-gray-400 font-mono">Choose Your Analytics View</p>
        </div>

        {/* Analytics Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Standard Analytics Card */}
          <div 
            onClick={() => onSelectAnalytics('standard')}
            className="bg-gray-800 p-8 rounded-xl border-2 border-purple-500 text-center cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:border-purple-400"
          >
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-mono font-bold text-purple-400 mb-4">STANDARD ANALYTICS</h3>
            <p className="text-gray-400 mb-6">Detailed metrics and insights with comprehensive data analysis</p>
            <div className="space-y-2 text-left text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Real-time performance metrics</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Congestion analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Weather impact assessment</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Operational recommendations</span>
              </div>
            </div>
            <div className="mt-6 bg-purple-900 text-purple-300 px-4 py-2 rounded font-mono text-sm">
              CLICK TO VIEW →
            </div>
          </div>

          {/* Enhanced Analytics Card */}
          <div 
            onClick={() => onSelectAnalytics('enhanced')}
            className="bg-gray-800 p-8 rounded-xl border-2 border-pink-500 text-center cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:border-pink-400"
          >
            <div className="text-6xl mb-4">📈</div>
            <h3 className="text-2xl font-mono font-bold text-pink-400 mb-4">VISUAL ANALYTICS</h3>
            <p className="text-gray-400 mb-6">Interactive charts and graphs with real-time visualizations</p>
            <div className="space-y-2 text-left text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Live gauge charts & trends</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Interactive data visualizations</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Historical trend analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Distribution charts</span>
              </div>
            </div>
            <div className="mt-6 bg-pink-900 text-pink-300 px-4 py-2 rounded font-mono text-sm">
              CLICK TO VIEW →
            </div>
          </div>
          {/* Predictive  Analytics Card */}
            <div
               onClick={() => onSelectAnalytics('predictive')}

                className="bg-gray-800 p-8 rounded-xl border-2 border-blue-500 text-center cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:border-blue-400"
            >
                <div className="text-6xl mb-4">🔮</div>
                <h3 className="text-2xl font-mono font-bold text-blue-400 mb-4">PREDICTIVE ANALYTICS</h3>
                <p className="text-gray-400 mb-6">Forecast future trends and optimize operations with AI-driven insights</p>
                <div className="space-y-2 text-left text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span>AI-powered trend forecasting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span>12 hour cogestion forecasting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Vessel arrival impact prediction</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span>wait time estimation</span>
                  </div>
                </div>
                <div className="mt-6 bg-blue-900 text-blue-300 px-4 py-2 rounded font-mono text-sm">
                  CLICK TO VIEW →
                </div>  
            </div>
         
          <div 
           onClick={() => onSelectAnalytics('live-model-integration')}
           className="bg-gray-800 p-8 rounded-xl border-2 border-green-500 text-center cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:border-green-400"
          >
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-2xl font-mono font-bold text-green-400 mb-4">LIVE ML PREDICTIONS</h3>
            <p className="text-gray-400 mb-6">Real-time API integration with your ML model</p>
            <div className="space-y-2 text-left text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Live API calls to your ML backend</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Real-time prediction display</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Auto-refresh every 30 seconds</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>API status monitoring</span>
              </div>
            </div>
            <div className="mt-6 bg-green-900 text-green-300 px-4 py-2 rounded font-mono text-sm">
              CLICK TO VIEW →
            </div>
          </div>
          <div 
            onClick={() => onSelectAnalytics('model-integration')}
            className="bg-gray-800 p-8 rounded-xl border-2 border-green-500 text-center cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:border-green-400"
          >
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-2xl font-mono font-bold text-green-400 mb-4">ML MODEL INTEGRATION</h3>
            <p className="text-gray-400 mb-6">Clean features ready for machine learning models</p>
            <div className="space-y-2 text-left text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Model-ready feature engineering</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>JSON output for ML APIs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Separate display vs model features</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Copy to clipboard integration</span>
              </div>
            </div>
            <div className="mt-6 bg-green-900 text-green-300 px-4 py-2 rounded font-mono text-sm">
              CLICK TO VIEW →
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-mono font-bold mb-4 text-center text-green-400">ANALYTICS FEATURES</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl text-blue-400 mb-2">📱</div>
              <div className="font-mono text-sm text-gray-400">Two Different Views</div>
              <div className="font-mono text-lg text-blue-400">Standard & Visual</div>
            </div>
            <div className="text-center">
              <div className="text-3xl text-green-400 mb-2">⚡</div>
              <div className="font-mono text-sm text-gray-400">Real-time Data</div>
              <div className="font-mono text-lg text-green-400">Live Updates</div>
            </div>
            <div className="text-center">
              <div className="text-3xl text-yellow-400 mb-2">🎯</div>
              <div className="font-mono text-sm text-gray-400">Actionable Insights</div>
              <div className="font-mono text-lg text-yellow-400">Smart Recommendations</div>
            </div>
          </div>
          
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 font-mono text-sm">
          PORT ANALYTICS HUB v2.0 | CHOOSE YOUR PREFERRED VIEW
        </div>
      </div>
    </div>
  );
};

export default AnalyticsHub;
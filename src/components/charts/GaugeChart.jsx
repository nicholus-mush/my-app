import React, { useRef, useEffect } from 'react';
import { Chart, DoughnutController, ArcElement, Tooltip } from 'chart.js';

Chart.register(DoughnutController, ArcElement, Tooltip);

const GaugeChart = ({ value, max = 100, title, color = '#10B981' }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      const percentage = (value / max) * 100;
      
      chartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          datasets: [{
            data: [value, max - value],
            backgroundColor: [color, '#374151'],
            borderWidth: 0,
            circumference: 180,
            rotation: 270
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            tooltip: {
              enabled: false
            },
            legend: {
              display: false
            }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [value, max, color]);

  return (
    <div className="relative w-full h-full">
      <canvas ref={chartRef} />
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
        <div className="text-2xl font-mono font-bold" style={{ color }}>
          {value}%
        </div>
        <div className="text-xs text-gray-400 font-mono mt-1">{title}</div>
      </div>
    </div>
  );
};

export default GaugeChart;
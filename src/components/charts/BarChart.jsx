import React, { useRef, useEffect } from 'react';
import { Chart, BarController, BarElement, LinearScale, Title, CategoryScale, Tooltip, Legend } from 'chart.js';

Chart.register(BarController, BarElement, LinearScale, Title, CategoryScale, Tooltip, Legend);

const BarChart = ({ data, labels, title, colors = ['#10B981'] }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: title,
            data: data,
            backgroundColor: colors,
            borderColor: colors.map(color => color.replace('0.2', '1')),
            borderWidth: 1,
            borderRadius: 4,
            borderSkipped: false,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: title,
              color: '#9CA3AF',
              font: {
                family: 'monospace',
                size: 14
              }
            }
          },
          scales: {
            x: {
              grid: {
                color: '#374151'
              },
              ticks: {
                color: '#9CA3AF',
                font: {
                  family: 'monospace'
                }
              }
            },
            y: {
              grid: {
                color: '#374151'
              },
              ticks: {
                color: '#9CA3AF',
                font: {
                  family: 'monospace'
                }
              }
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
  }, [data, labels, title, colors]);

  return <canvas ref={chartRef} />;
};

export default BarChart;
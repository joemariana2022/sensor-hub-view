
import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface DataChartProps {
  data: number[];
  labels: string[];
  title: string;
  type?: 'line' | 'bar' | 'area';
  color?: string;
}

const DataChart: React.FC<DataChartProps> = ({ 
  data, 
  labels, 
  title, 
  type = 'line',
  color = '#06b6d4' 
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        // Destroy existing chart
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        chartInstance.current = new Chart(ctx, {
          type: type === 'area' ? 'line' : type,
          data: {
            labels,
            datasets: [{
              label: title,
              data,
              borderColor: color,
              backgroundColor: type === 'area' ? `${color}20` : color,
              fill: type === 'area',
              tension: 0.4,
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
                color: '#64748b'
              }
            },
            scales: {
              y: {
                beginAtZero: false,
                grid: {
                  color: '#e2e8f0'
                },
                ticks: {
                  color: '#64748b'
                }
              },
              x: {
                grid: {
                  color: '#e2e8f0'
                },
                ticks: {
                  color: '#64748b'
                }
              }
            }
          }
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, labels, title, type, color]);

  return (
    <div className="h-64 w-full">
      <canvas ref={chartRef} />
    </div>
  );
};

export default DataChart;

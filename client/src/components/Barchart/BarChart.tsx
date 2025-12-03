import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import type { ChartOptions, ChartData } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartDataLabels);

interface BarChartProps {
    ratings: number[]; 
}
const BarChart: React.FC<BarChartProps> = ({ ratings }) => {
  const maxVotes = Math.max(...ratings);
  const data: ChartData<'bar'> = {
  labels: ['Awesome 5', 'Great 4', 'Good 3', 'OK 2', 'Awful 1'],
  datasets: [
      // Foreground bar (actual value) - FF XIV gradient colors
      {
        label: 'Ratings',
        data: ratings,
        backgroundColor: [
          '#7ff6c3', // Awesome 5 - Green (keeping your existing green)
          '#fbbf24', // Great 4 - Gold
          '#fff170', // Good 3 - Yellow (keeping your existing yellow)
          '#f2994a', // OK 2 - Orange
          '#ff9c9c', // Awful 1 - Red (keeping your existing red)
        ],
        barThickness: 35,
        grouped: false,
      },
      {
        label: 'Background',
        data: new Array(ratings.length).fill(maxVotes),
        backgroundColor: '#1a1a2e', // Dark background matching theme
        barThickness: 35,
        hoverBackgroundColor: '#1a1a2e'
      }

  ]};

  const options: ChartOptions<'bar'> = {
    responsive: true,
    indexAxis: 'y',
    layout: {
      padding: {
        right: 50
      }
    },
    plugins: {
      datalabels: {
        display: (context) => context.datasetIndex === 0,
        align: 'end', 
        anchor: 'end',
        color: '#ffffff', // White text for visibility
        font: {
          size: 20,
          weight: 'bold',
        },
        formatter: (value: number) => `${value}`
      }
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
          color: '#ffffff', // White labels
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      }
    }
  };

  return (
    <div style={{ width: '500px', height: '300px' }}>
      <Bar data={data} options={options} plugins={[ChartDataLabels]}/>
    </div>
  )
}
export default BarChart;
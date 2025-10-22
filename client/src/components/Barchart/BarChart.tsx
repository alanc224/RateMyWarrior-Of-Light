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
          // Foreground bar (actual value)
      {
        label: 'Ratings',
        data: ratings,
        backgroundColor: '#0055fd',
        barThickness: 35,
        grouped: false,
      },
      {
        label: 'Background',
        data: new Array(ratings.length).fill(maxVotes),
        backgroundColor: '#e0e0e0',
        barThickness: 35,
        hoverBackgroundColor: '#e0e0e0'
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
        color: '#000',
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
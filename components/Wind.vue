<script>
import { Radar, mixins } from 'vue-chartjs'
const { reactiveData } = mixins

export default {
  extends: Radar,
  mixins: [reactiveData],
  props: {
    label: {
      type: Object,
    },
    numb: {
      type: Array,
    },
    data: {
      type: Array,
    },
  },
  data() {
    return {
      chartData: {
        labels: this.numb,
        datasets: [
          {
            label: 'wind',
            backgroundColor: '#00bfff',
            data: this.data,
          },
        ],
      },
      options: {
        scale: {
          ticks: {
            max: 5,
            beginAtZero: true,
          },
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    }
  },
  mounted() {
    this.renderChart(this.chartData, this.options)
  },
}
</script>

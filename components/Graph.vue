<script>
import { Line, mixins } from 'vue-chartjs'
const { reactiveData } = mixins

export default {
  extends: Line,
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
            lineTension: 0,
            label: this.label.name,
            backgroundColor: '#f87979',
            data: this.data,
          },
        ],
      },
      options: {
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

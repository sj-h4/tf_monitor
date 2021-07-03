<script>
import { Radar, mixins } from 'vue-chartjs'
const { reactiveData } = mixins

export default {
  extends: Radar,
  mixins: [reactiveData],
  props: {
    numb: {
      type: Array,
      default: null,
    },
    data: {
      type: Array,
      default: null,
    },
  },
  data() {
    return {
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
  watch: {
    data() {
      this.render()
      console.log(this.data)
    },
  },
  mounted() {
    this.render()
  },
  methods: {
    render() {
      this.chartData = {
        labels: this.numb,
        datasets: [
          {
            label: 'wind',
            backgroundColor: '#00bfff',
            data: this.data,
          },
        ],
      }
    },
  },
}
</script>

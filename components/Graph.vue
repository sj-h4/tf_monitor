<script>
import { Line, mixins } from 'vue-chartjs'
const { reactiveData } = mixins

export default {
  extends: Line,
  mixins: [reactiveData],
  props: {
    label: {
      type: String,
      default: null,
    },
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
        responsive: true,
        maintainAspectRatio: false,
      },
    }
  },

  watch: {
    data() {
      this.render()
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
            lineTension: 0,
            label: this.label,
            borderColor: '#f87979',
            pointBackgroundColor: '#f87979',
            data: this.data,
            fill: false,
          },
        ],
      }
    },
  },
}
</script>

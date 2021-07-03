<script>
import { Line, mixins } from 'vue-chartjs'
const { reactiveData } = mixins

export default {
  extends: Line,
  mixins: [reactiveData],
  props: {
    label: {
      type: Object,
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
            label: this.label.name,
            backgroundColor: '#f87979',
            data: this.data,
          },
        ],
      }
    },
  },
}
</script>

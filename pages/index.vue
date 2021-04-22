<template>
  <div>
    <div v-for="(i, key) in item" :key="key">
      <graph
        v-if="loaded"
        :label="item[key]"
        :numb="numb[key]"
        :data="data[key]"
      />
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Graph from '~/components/Graph.vue'

export default {
  components: {
    Graph,
  },
  data() {
    return {
      numb: [],
      item: [],
      data: [],
      loaded: false,
    }
  },
  mounted() {
    for (let x = 0; x < 3; x++) {
      this.data.push([])
      this.numb.push([])
    }
    this.get()
    this.$setInterval(() => {
      this.get()
    }, 10000)
  },
  methods: {
    async get() {
      await axios
        .get('https://tatekan.copynight.net/kubtss/item/')
        .then((res) => {
          this.item = res.data
        })
        .catch((err) => {
          return err
        })
      for (const i in this.item) {
        await axios
          .get(
            'https://tatekan.copynight.net/kubtss/data/?item=' +
              this.item[i].name
          )
          .then((res) => {
            this.data[i] = res.data
          })
          .catch((err) => {
            return err
          })
        const l = []
        const n = []
        this.data[i].forEach(function (elem) {
          l.push(elem.data)
          n.push(elem.numbering)
        })
        this.data[i] = l
        this.numb[i] = n
      }
      this.loaded = true
    },
  },
}
</script>

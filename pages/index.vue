<template>
  <div>
    <v-select
      v-model="selected"
      placeholder="取得データ数"
      :options="['10', '100', '1000']"
      @input="handleSelect"
    ></v-select>
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
      selected: '100',
      numb: [],
      item: [],
      tf: [],
      data: [],
      loaded: false,
    }
  },
  async mounted() {
    for (let x = 0; x < 3; x++) {
      this.data.push([])
      this.numb.push([])
    }
    await axios
      .get('https://tatekan.copynight.net/kubtss/tf/')
      .then((res) => {
        this.tf = res.data
      })
      .catch((err) => {
        return err
      })
    await axios
      .get('https://tatekan.copynight.net/kubtss/item/')
      .then((res) => {
        this.item = res.data
      })
      .catch((err) => {
        return err
      })
    this.$clearAllIntervals()
    this.get()
    this.$setInterval(() => {
      this.get()
    }, 10000)
  },
  methods: {
    handleSelect() {
      this.$clearAllIntervals()
      this.get()
      this.$setInterval(() => {
        this.get()
      }, 10000)
    },
    async get() {
      this.loaded = false
      for (const i in this.item) {
        await axios
          .get(
            'https://tatekan.copynight.net/kubtss/data/?item=' +
              this.item[i].name +
              '&top=' +
              this.selected
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
          l.unshift(elem.data)
          n.unshift(elem.numbering)
        })
        this.data[i] = l
        this.numb[i] = n
      }
      this.loaded = true
    },
  },
}
</script>

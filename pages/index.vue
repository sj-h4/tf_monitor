<template>
  <v-container>
    <v-row>
      <v-col cols="6">
        <v-select
          v-model="selected"
          placeholder="取得データ数"
          :options="['10', '50', '100', '500']"
          @input="handleSelect"
        ></v-select>
      </v-col>
      <v-col cols="6">
        <v-select
          v-model="selected2"
          placeholder="TF選択"
          :options="tf"
          @input="handleSelect"
        ></v-select>
      </v-col>
      <v-col v-for="(i, key) in latestData" :key="key" cols="4">
        <v-card elevation="2" tile>
          <v-card-title>最新の{{ latestDataLabel[key] }}</v-card-title>
          <v-card-subtitle>{{ i }}{{ latestDataUnit[key] }}</v-card-subtitle>
        </v-card>
      </v-col>
      <v-col v-for="(i, key) in item" :key="key" cols="12">
        <graph
          v-if="loaded"
          :label="item[key]"
          :numb="numb[key]"
          :data="data[key]"
        />
      </v-col>
    </v-row>
  </v-container>
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
      selected: '10',
      selected2: '',
      numb: [],
      item: [],
      tf: [],
      data: [],
      latestDataLabel: ['気速', '高度', '回転数'],
      latestDataUnit: ['m/s', 'm', 'rad/s'],
      latestData: [],
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
        const t = []
        this.tf.forEach(function (elem) {
          t.unshift(elem.name)
        })
        this.tf = t
        this.selected2 = this.tf[0]
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
              '&tf=' +
              this.selected2 +
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
      const ld = []
      ld.push(this.data[0][this.data[0].length - 1])
      ld.push(this.data[1][this.data[1].length - 1])
      ld.push(this.data[2][this.data[2].length - 1])
      this.latestData = ld
      this.loaded = true
    },
  },
}
</script>

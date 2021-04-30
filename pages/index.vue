<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-row>
          <v-col cols="6">
            <v-select
              v-model="selected"
              label="取得データ数"
              :items="items"
              @change="handleSelect"
            ></v-select>
          </v-col>
          <v-col cols="6">
            <v-select
              v-model="selected2"
              label="TF選択"
              :items="tf"
              @change="handleSelect"
            ></v-select>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12">
        <v-row no-gutters>
          <v-col v-for="(i, key) in latestData" :key="'A' + key" cols="3">
            <v-card elevation="2" tile>
              <v-card-title>{{ latestDataLabel[key] }}</v-card-title>
              <v-card-subtitle>{{ i }}{{ item[key].unit }}</v-card-subtitle>
            </v-card>
          </v-col>
          <v-col cols="3">
            <v-card elevation="2" tile>
              <v-card-title>風速</v-card-title>
              <v-card-subtitle>{{ ws }}m/s</v-card-subtitle>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12">
        <v-card elevation="2" tile>
          <wind v-if="loaded" :numb="wdnumb" :data="wddata" />
        </v-card>
      </v-col>
      <v-col v-for="(i, key) in item" :key="'B' + key" cols="12">
        <v-card elevation="2" tile>
          <graph
            v-if="loaded"
            :label="item[key]"
            :numb="numb[key]"
            :data="data[key]"
          />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios'
import Graph from '~/components/Graph.vue'
import Wind from '~/components/Wind.vue'

export default {
  components: {
    Graph,
    Wind,
  },
  data() {
    return {
      selected: '10',
      selected2: '',
      numb: [],
      item: [],
      tf: [],
      data: [],
      ws: '',
      wd: '',
      wdnumb: [36],
      wddata: [0],
      items: ['10', '50', '100', '500'],
      latestDataLabel: ['高度', '気速', '回転数'],
      latestData: [],
      loaded: false,
    }
  },
  async mounted() {
    for (let x = 1; x < 36; x++) {
      this.wdnumb.push(x)
      this.wddata.push(0)
    }
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
      await axios
        .get('https://tatekan.copynight.net/kubtss/subdata/?top=1&subitem=ws')
        .then((res) => {
          this.ws = res.data
          this.ws = this.ws[0].subdata
        })
        .catch((err) => {
          return err
        })
      await axios
        .get('https://tatekan.copynight.net/kubtss/subdata/?top=1&subitem=wd')
        .then((res) => {
          this.wd = res.data
          this.wd = this.wd[0].subdata
          for (let x = 0; x < 36; x++) {
            this.wddata[x] = 0
          }
          if (this.wd === 36) {
            this.wddata[0] = this.ws
          } else {
            this.wddata[this.wd] = this.ws
          }
          this.wddata[(this.wd + 1) % 36] = this.ws * 0.7
          this.wddata[this.wd - 1] = this.ws * 0.7
        })
        .catch((err) => {
          return err
        })
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
          n.unshift(elem.created_at.substr(11, 11))
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

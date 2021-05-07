<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-row>
          <v-col cols="2">
            <switches v-model="enabled" theme="bulma" color="red"></switches>
          </v-col>
          <v-col cols="4">
            <v-btn color="primary" depressed block large @click="reload()">
              TFリロード
            </v-btn>
          </v-col>
          <v-col cols="6" />
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
          <v-col v-for="(i, key) in latestData" :key="'A' + key" cols="6">
            <v-card elevation="2" tile>
              <v-card-text>
                <div>{{ item[key].label }}</div>
                <p class="display-1 text--primary">
                  {{ i }}{{ item[key].unit }}
                </p>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card elevation="2" tile>
              <v-card-text>
                <div>風速</div>
                <p class="display-1 text--primary">{{ real }}m/s</p>
              </v-card-text>
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
      enabled: 'true',
      selected: '10',
      selected2: '',
      numb: [],
      item: [],
      tf: [],
      data: [],
      real: '',
      ws: '',
      wd: '',
      wdnumb: [36],
      wddata: [0],
      items: ['10', '50', '100', '500'],
      latestData: [],
      loaded: false,
    }
  },
  watch: {
    enabled() {
      if (this.enabled === false) {
        this.$clearAllIntervals()
      }
      if (this.enabled === true) {
        this.$clearAllIntervals()
        this.$setInterval(() => {
          this.getLatest()
        }, 1000)
        this.$setInterval(() => {
          this.get()
        }, 10000)
      }
    },
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
    this.getLatest()
    this.get()

    this.$setInterval(() => {
      this.getLatest()
    }, 1000)
    this.$setInterval(() => {
      this.get()
    }, 10000)
  },
  methods: {
    async reload() {
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
    },
    handleSelect() {
      this.$clearAllIntervals()
      this.getLatest()
      this.get()

      this.$setInterval(() => {
        this.getLatest()
      }, 1000)
      this.$setInterval(() => {
        this.get()
      }, 10000)
    },
    async get() {
      this.loaded = false
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
      this.loaded = true
    },
    async getLatest() {
      await axios
        .get('https://tatekan.copynight.net/kubtss/subdata/?top=1&subitem=ws')
        .then((res) => {
          this.ws = res.data
          this.real = this.ws[0].subdata
          this.ws = this.ws[0].subdata
          if (this.ws > 5) {
            this.ws = 5
          }
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
              '&top=1'
          )
          .then((res) => {
            this.latestData[i] = res.data[0].data
          })
          .catch((err) => {
            return err
          })
        this.latestData.splice(5)
      }
    },
  },
}
</script>

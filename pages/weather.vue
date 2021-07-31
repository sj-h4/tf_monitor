<template>
  <v-container>
    <v-row>
      <v-col cols="4">
        <v-row>
          <v-col cols="2">
            <switches v-model="enabled" theme="bulma" color="red"></switches>
          </v-col>
          <v-col cols="8">
            <v-select
              v-model="selected"
              label="データ選択"
              :items="datetime"
              @change="handleSelect"
            ></v-select>
          </v-col>
          <v-col cols="2">
            <v-btn class="mx-2" fab dark small color="red" @click="place()">
              <v-icon dark> mdi-target </v-icon>
            </v-btn>
          </v-col>
          <v-col cols="6">
            <v-card elevation="2" tile>
              <v-card-text>
                <div>風速</div>
                <p class="display-1 text--primary">{{ real }}m/s</p>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="6" />
          <v-col cols="12">
            <v-card elevation="2" tile>
              <wind :numb="wdnumb" :data="wddata" />
            </v-card>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="8">
        <v-card>
          <div id="map">
            <no-ssr>
              <l-map
                ref="kubtss"
                :zoom="zoom"
                :center="center"
                :min-zoom="minZoom"
                :max-zoom="maxZoom"
              >
                <l-tile-layer :url="url"></l-tile-layer>
                <l-marker
                  v-for="(w, key) in winddata"
                  :key="key"
                  :lat-lng="[w.longitude, w.latitude]"
                  :icon="icongenerate((Math.round(w.wd / 2.25) % 16) + 1, w.ws)"
                  ><l-popup :content="String(w.ws) + 'm/s'"></l-popup>
                </l-marker>
                <l-marker :lat-lng="[pt[0], pt[1]]" :icon="placegenerate()">
                </l-marker>
              </l-map>
            </no-ssr>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios'
import Wind from '~/components/Wind.vue'

export default {
  components: {
    Wind,
  },
  data() {
    return {
      enabled: 'true',
      real: '',
      ws: '',
      wd: '',
      wdnumb: [],
      wddata: [],
      longitude: '',
      latitude: '',
      datetime: [],
      winddata: [],
      selected: '',
      pt: [35.293454, 136.124555],

      // leafletの設定
      center: [35.293454, 136.124555],
      zoom: 11,
      minZoom: 11,
      maxZoom: 15,
      url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
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
        }, 500)
      }
    },
  },
  async mounted() {
    this.wdnumb.push(36)
    for (let x = 1; x < 36; x++) {
      this.wdnumb.push(x)
    }

    const winddatetime = axios
      .get('https://tatekan.copynight.net/kubtss/winddatetime/')
      .then((res) => {
        this.datetime = res.data
        const d = []
        const di = []
        this.datetime.forEach(function (elem) {
          d.unshift(elem.datetime)
          di.unshift(elem.id)
        })
        this.datetime = d
        this.selected = this.datetime[0]
      })
      .catch((err) => {
        return err
      })

    await winddatetime

    this.$clearAllIntervals()
    this.getLatest()
    this.get()

    this.$setInterval(() => {
      this.getLatest()
    }, 500)
  },
  methods: {
    place() {
      this.center = []
      this.center.push(0)
      this.center.push(0)
      this.center = []
      this.center.push(this.latitude)
      this.center.push(this.longitude)
    },
    icongenerate(iwd, iws) {
      return this.$L.icon({
        iconUrl: 'https://copynight.net/weather/' + String(iwd) + '.png',
        iconSize: [32 * Math.sqrt(iws), 32 * Math.sqrt(iws)],
      })
    },
    placegenerate() {
      return this.$L.icon({
        iconAnchor: [15, 24],
        iconUrl: 'https://copynight.net/weather/marker-icon.png',
        iconSize: [30, 48],
      })
    },
    handleSelect() {
      this.$clearAllIntervals()
      this.getLatest()
      this.get()
      if (this.enabled === 'true' || this.enabled === true) {
        this.$setInterval(() => {
          this.getLatest()
        }, 500)
      }
    },
    get() {
      axios
        .get(
          'https://tatekan.copynight.net/kubtss/winddata/?datetime=' +
            this.selected
        )
        .then((res) => {
          this.winddata = res.data
          this.winddata.splice()
        })
        .catch((err) => {
          return err
        })
    },
    async getLatest() {
      const wd = axios
        .get('https://tatekan.copynight.net/kubtss/subdata/?top=1&subitem=wd')
        .then((res) => {
          this.wd = res.data
          this.wd = this.wd[0].subdata
          this.wddata = []
          for (let x = 0; x < 36; x++) {
            this.wddata.push(0)
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
      await wd
      axios
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
      const latitude = axios
        .get(
          'https://tatekan.copynight.net/kubtss/subdata/?top=1&subitem=latitude'
        )
        .then((res) => {
          this.latitude = res.data[0].subdata
        })
        .catch((err) => {
          return err
        })
      const longitude = axios
        .get(
          'https://tatekan.copynight.net/kubtss/subdata/?top=1&subitem=longitude'
        )
        .then((res) => {
          this.longitude = res.data[0].subdata
        })
        .catch((err) => {
          return err
        })
      await latitude
      await longitude
      this.pt = []
      this.pt.push(this.latitude)
      this.pt.push(this.longitude)
    },
  },
}
</script>

<style scoped>
#map {
  height: 95vh;
  width: 75vw;
}
</style>

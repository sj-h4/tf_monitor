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
          <v-col cols="6" class="hidden-md-and-up" />
          <v-col cols="6" md="3">
            <v-select
              v-model="selected"
              label="取得データ数"
              :items="items"
              @change="handleSelect"
            ></v-select>
          </v-col>
          <v-col cols="6" md="3">
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
          <v-col
            v-for="(i, key) in latestData"
            :key="'A' + key"
            cols="6"
            md="2"
          >
            <v-card elevation="2" tile>
              <v-card-text>
                <div>{{ item[key].name }}</div>
                <p class="display-1 text--primary">
                  {{ i }}{{ item[key].unit }}
                </p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
      <v-col v-for="(i, key) in item" :key="'B' + key" cols="12" md="4">
        <v-card elevation="2" tile>
          <graph :label="item[key].name" :numb="numb[key]" :data="data[key]" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Graph from '~/components/Graph.vue'

export default {
  components: {
    Graph,
  },
  data() {
    return {
      enabled: 'false',
      selected: '50',
      selected2: '',
      numb: [],
      item: [
        { name: 'airspeed', unit: 'm/s' },
        { name: 'altitude', unit: 'm' },
        { name: 'rotation', unit: 'rpm' },
        { name: 'power', unit: 'w' },
        { name: 'pitch', unit: 'deg' },
        { name: 'roll', unit: 'deg' },
      ],
      tf: [],
      data: [],
      real: '',
      items: ['50', '100', '300', '1000'],
      latestData: [],
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
        this.$setInterval(() => {
          this.get()
        }, Number(this.selected) * 100)
      }
    },
  },
  async mounted() {
    const tf = this.$axios
      .get('/api/tf', {
        headers: { 'X-Api-Key': this.$config.apiKey },
      })
      .then((res) => {
        this.tf = res.data
        const t = []
        const ti = []
        this.tf.forEach(function (elem) {
          t.push(elem.tf_name)
          ti.push(elem.created_at)
        })
        this.tf = t
        this.selected2 = this.tf[0]
      })
      .catch((err) => {
        return err
      })
    await tf
    this.$clearAllIntervals()
    this.getLatest()
    this.get()

    this.$setInterval(() => {
      this.getLatest()
    }, 500)
    this.$setInterval(() => {
      this.get()
    }, Number(this.selected) * 100)
  },
  methods: {
    async reload() {
      const tf = this.$axios
        .get('/api/tf', {
          headers: { 'X-Api-Key': this.$config.apiKey },
        })
        .then((res) => {
          this.tf = res.data
          this.$log.debug(res)
          const t = []
          this.tf.forEach(function (elem) {
            t.push(elem.tf_name)
          })
          this.tf = t
          this.selected2 = this.tf[0]
        })
        .catch((err) => {
          return err
        })
      await tf
    },
    /*
    download(key) {
      axios
        .get(
          process.env.VUE_APP_BASE_URL +
            '?tf=' +
            this.selected2 +
            '&item=' +
            this.item[key].name,
          { responseType: 'blob' }
        )
        .then((response) => {
          const url = URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute(
            'download',
            this.selected2 + '_' + this.item[key].name + '.csv'
          )
          document.body.appendChild(link)
          link.click()
        })
    },
    */
    handleSelect() {
      this.$clearAllIntervals()
      this.getLatest()
      this.get()
      if (this.enabled === 'true' || this.enabled === true) {
        this.$setInterval(() => {
          this.getLatest()
        }, 500)
        this.$setInterval(() => {
          this.get()
        }, Number(this.selected) * 100)
      }
    },
    async get() {
      const dt = this.$axios
        .get('/api/data?tf_name=' + this.selected2, {
          headers: { 'X-Api-Key': this.$config.apiKey },
        })
        .then((res) => {
          const response = res.data
          this.item.forEach((value, index) => {
            const l = []
            const n = []
            for (const record of response) {
              l.push(record[value.name])
              n.push(record.created_at.substr(11, 11))
            }
            this.data[index] = l
            this.numb[index] = n
            this.$log.debug(this.data)
          })
        })
        .catch((err) => {
          this.$log.debug(err)
          return err
        })
      await dt
      this.data.splice()
      this.numb.splice()
    },
    getLatest() {
      this.$axios
        .get('/api/data?tf_name=' + this.selected2, {
          headers: { 'X-Api-Key': this.$config.apiKey },
        })
        .then((res) => {
          const response = res.data
          this.item.forEach((value, index) => {
            const itemLabel = value.name
            this.latestData[index] = response[0][itemLabel]
          })
        })
        .catch((err) => {
          return err
        })
      this.latestData.splice(5)
    },
  },
}
</script>

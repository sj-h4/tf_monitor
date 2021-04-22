import Vue from 'vue'

Vue.prototype.$intervals = []

Vue.prototype.$setInterval = (func, intervalMilliSec) => {
  const id = setInterval(() => {
    if (document.visibilityState === 'visible') {
      func()
    }
  }, intervalMilliSec)
  Vue.prototype.$intervals.push(id)
  return id
}

Vue.prototype.$clearInterval = (id) => {
  clearInterval(id)
  Vue.prototype.$intervals = Vue.prototype.$intervals.filter((i) => i !== id)
}

Vue.prototype.$clearAllIntervals = () => {
  Vue.prototype.$intervals.forEach(clearInterval)
  Vue.prototype.$intervals = []
}

export default ({ app }) => {
  app.router.afterEach((to, from) => {
    Vue.prototype.$clearAllIntervals()
  })
}

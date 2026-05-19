import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueFire, VueFireAuth } from 'vuefire'

import './style.css'
import App from './App.vue'
import { firebaseApp } from './firebase'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()],
})
app.use(router)

app.mount('#app')

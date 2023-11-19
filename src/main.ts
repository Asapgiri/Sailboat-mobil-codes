import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import { repo } from './abstract/repository'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'bootstrap/dist/js/bootstrap.min.js'
import '@popperjs/core/dist/cjs/popper.js'

export const app = createApp(App)

repo.init(app)

app.mount('#app')



import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import { repo } from './abstract/repository'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'
import 'bootstrap/js/index.esm.js'
import '@popperjs/core/dist/umd/popper.min.js'


export const app = createApp(App)

repo.init(app)

app.mount('#app')



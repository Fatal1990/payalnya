import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './styles/main.scss'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

import { setupMockAdapter } from './api/mockAdapter'
setupMockAdapter()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

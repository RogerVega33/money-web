import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from "./store";
import './assets/tailwind.css'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

library.add(fas, fab)

createApp(App)
    .use(router)
    .use(store)
    .component('fa', FontAwesomeIcon)
    .component('Datepicker', Datepicker)
    .mount('#app')

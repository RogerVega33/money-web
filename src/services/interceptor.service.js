import axios from 'axios'
import router from '../router'
import store from '../store'

axios.interceptors.response.use(
    response => response,
    error => {
        console.error("error:",error)
        if (error.response?.status === 403) {
            store.dispatch('auth/logout')
            router.push('/')
        }
        return Promise.reject(error)
    }
)
import axios from 'axios'
import router from '../router'
import store from '../store'
import { readSession } from '../utils/session'

function isProtectedRequest(config) {
    return /^\/api\/(wallet|category|transaction)(?:[/?]|$)/.test(config?.url || '')
}

function authorization(config) {
    return config?.headers?.get?.('Authorization') ?? config?.headers?.Authorization ?? ''
}

function sessionAuthorization(user) {
    return user?.token ? `Bearer ${user.token}` : ''
}

axios.interceptors.response.use(
    response => {
        if (isProtectedRequest(response.config)) {
            const sent = authorization(response.config)
            if (sent !== sessionAuthorization(readSession()) ||
                sent !== sessionAuthorization(store.state.auth.user)) {
                return Promise.reject(new axios.CanceledError('La sesión cambió durante la solicitud.'))
            }
        }
        return response
    },
    error => {
        if ([401, 403].includes(error.response?.status) && isProtectedRequest(error.config) &&
            authorization(error.config) === sessionAuthorization(readSession())) {
            // Un error tardío de la cuenta anterior no debe cerrar la nueva sesión.
            store.dispatch('auth/logout')
            router.replace('/login')
        }
        return Promise.reject(error)
    }
)

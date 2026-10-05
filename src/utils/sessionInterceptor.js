import { readSession, renewedSession, sameSessionToken } from './session.js'

function isProtectedRequest(config) {
    return /^\/api\/(wallet|category|transaction)(?:[/?]|$)/.test(config?.url || '')
}

function authorization(config) {
    return config?.headers?.get?.('Authorization') ?? config?.headers?.Authorization ?? ''
}

function requestToken(config) {
    return authorization(config).replace(/^Bearer /, '')
}

export function installSessionInterceptor(axios, store, router) {
    return axios.interceptors.response.use(
        response => {
            if (isProtectedRequest(response.config)) {
                const sent = requestToken(response.config)
                const current = readSession()
                if (!sameSessionToken(sent, current?.token) ||
                    !sameSessionToken(sent, store.state.auth.user?.token)) {
                    return Promise.reject(new axios.CanceledError('La sesión cambió durante la solicitud.'))
                }
                const next = renewedSession(current, response.headers?.['x-session-token'])
                if (next !== current) {
                    localStorage.setItem('user', JSON.stringify(next))
                    store.commit('auth/syncSession', next)
                }
            }
            return response
        },
        error => {
            const sent = requestToken(error.config)
            const current = readSession()?.token
            const revoked = error.response?.data?.body?.code === 'SESSION_REVOKED'
            if ([401, 403].includes(error.response?.status) && isProtectedRequest(error.config) &&
                (sent === current || (revoked && sameSessionToken(sent, current)))) {
                // Revocación afecta a todos los tokens del mismo sid; vencimiento
                // de un token anterior no debe cerrar una sesión ya renovada.
                store.dispatch('auth/clearSession')
                router.replace('/login')
            }
            return Promise.reject(error)
        }
    )
}

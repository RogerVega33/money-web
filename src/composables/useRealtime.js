import { onScopeDispose, ref, watch } from 'vue'
import { io } from 'socket.io-client'
import { useRouter } from 'vue-router'
import store from '@/store'
import { readSession, sameSessionToken } from '@/utils/session'

export function useRealtime(onChanged, onPricesUpdated = () => {}) {
    const router = useRouter()
    const connected = ref(false)
    let socket

    function stop() {
        socket?.removeAllListeners()
        socket?.disconnect()
        socket = null
        connected.value = false
    }

    watch(() => store.state.auth.user?.token, (token) => {
        stop()
        if (!token) return
        socket = io({ path: '/api/socket.io', auth: { token }, autoConnect: false })
        const revoked = () => {
            if (sameSessionToken(token, readSession()?.token) && sameSessionToken(token, store.state.auth.user?.token)) {
                store.dispatch('auth/clearSession')
                // La página protegida debe volver al inicio de sesión.
                router.replace('/login')
            }
        }
        socket.on('connect', () => {
            connected.value = true
            // También cubre cambios ocurridos antes de la primera conexión.
            onChanged()
        })
        socket.on('disconnect', () => { connected.value = false })
        socket.on('connect_error', error => {
            connected.value = false
            if (error.data?.code === 'SESSION_REVOKED') revoked()
        })
        socket.on('session:revoked', revoked)
        socket.on('transactions:changed', onChanged)
        socket.on('crypto:pricesUpdated', onPricesUpdated)
        socket.connect()
    }, { immediate: true, flush: 'sync' })

    onScopeDispose(stop)
    return { connected }
}

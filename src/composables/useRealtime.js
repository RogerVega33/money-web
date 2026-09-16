import { onScopeDispose, ref, watch } from 'vue'
import { io } from 'socket.io-client'
import store from '@/store'

export function useRealtime(onChanged, onPricesUpdated = () => {}) {
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
        socket.on('connect', () => {
            connected.value = true
            // También cubre cambios ocurridos antes de la primera conexión.
            onChanged()
        })
        socket.on('disconnect', () => { connected.value = false })
        socket.on('connect_error', () => { connected.value = false })
        socket.on('transactions:changed', onChanged)
        socket.on('crypto:pricesUpdated', onPricesUpdated)
        socket.connect()
    }, { immediate: true, flush: 'sync' })

    onScopeDispose(stop)
    return { connected }
}

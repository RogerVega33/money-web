import { onScopeDispose } from 'vue'
import { readSession, sessionKey } from '../utils/session.js'

export function useSessionSync(store, router) {
    function sync(event) {
        if (event.storageArea !== localStorage || (event.key !== 'user' && event.key !== null)) return
        // Leer el valor actual: puede haber varios eventos de sesión en la cola.
        const user = readSession()
        const previous = store.state.auth.user
        if (previous?.token === user?.token && previous?.id === user?.id) return
        const changedSession = sessionKey(previous) !== sessionKey(user)
        store.commit('auth/syncSession', user)
        if (changedSession) router.replace(user ? '/dashboard' : '/login')
    }

    window.addEventListener('storage', sync)
    onScopeDispose(() => window.removeEventListener('storage', sync))
}

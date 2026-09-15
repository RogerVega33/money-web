import { onScopeDispose } from 'vue'
import { readSession } from '@/utils/session'

export function useSessionSync(store, router) {
    function sync(event) {
        if (event.storageArea !== localStorage || (event.key !== 'user' && event.key !== null)) return
        // Leer el valor actual: puede haber varios eventos de sesión en la cola.
        const user = readSession()
        const previous = store.state.auth.user
        if (previous?.token === user?.token && previous?.id === user?.id) return
        store.commit('auth/syncSession', user)
        router.replace(user ? '/dashboard' : '/login')
    }

    window.addEventListener('storage', sync)
    onScopeDispose(() => window.removeEventListener('storage', sync))
}

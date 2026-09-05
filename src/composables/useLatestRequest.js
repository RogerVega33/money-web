import { ref, onScopeDispose } from 'vue'

// Cada instancia representa una sección de datos, aunque use distintos endpoints.
export function useLatestRequest() {
    const loading = ref(false)
    const error = ref(null)
    let version = 0

    function invalidate() {
        version++
        loading.value = false
        error.value = null
    }

    async function run(load, apply) {
        const current = ++version
        loading.value = true
        error.value = null
        try {
            const response = await load()
            if (current === version) apply(response)
        } catch (cause) {
            if (current === version) error.value = cause
        } finally {
            if (current === version) loading.value = false
        }
    }

    onScopeDispose(invalidate)
    return { loading, error, run, invalidate }
}

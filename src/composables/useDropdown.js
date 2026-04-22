import { ref, onMounted, onUnmounted } from 'vue'

const openDropdownId = ref(null)
let listenerCount = 0

function handleClickOutside() {
    openDropdownId.value = null
}

export function useDropdown() {
    onMounted(() => {
        if (listenerCount === 0) {
            document.addEventListener('click', handleClickOutside)
        }
        listenerCount++
    })

    onUnmounted(() => {
        listenerCount--
        if (listenerCount === 0) {
            document.removeEventListener('click', handleClickOutside)
        }
    })

    function openDropdown(id) {
        openDropdownId.value = id
    }

    function closeDropdown(id) {
        if (openDropdownId.value === id) openDropdownId.value = null
    }

    function isOpen(id) {
        return openDropdownId.value === id
    }

    return { openDropdown, closeDropdown, isOpen }
}
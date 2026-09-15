export function readSession() {
    try {
        const user = JSON.parse(localStorage.getItem('user'))
        if (!user || typeof user !== 'object' || Array.isArray(user) ||
            !Number.isSafeInteger(user.id) || user.id <= 0 ||
            typeof user.username !== 'string' || !user.username.trim() ||
            typeof user.token !== 'string' || !user.token.trim()) return null
        return user
    } catch {
        return null
    }
}

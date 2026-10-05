export function readSession() {
    try {
        const user = JSON.parse(localStorage.getItem('user'))
        if (!user || typeof user !== 'object' || Array.isArray(user) ||
            !Number.isSafeInteger(user.id) || user.id <= 0 ||
            typeof user.username !== 'string' || !user.username.trim() ||
            typeof user.token !== 'string' || !user.token.trim() ||
            !tokenSessionKey(user.token)) return null
        return user
    } catch {
        return null
    }
}

function tokenClaims(token) {
    try {
        const encoded = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
        return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(encoded), c => c.charCodeAt(0))))
    } catch {
        return null
    }
}

function tokenSessionKey(token) {
    const claims = tokenClaims(token)
    if (!Number.isSafeInteger(claims?.id) || claims.id <= 0 || !Number.isFinite(claims.iat) ||
        typeof claims.sid !== 'string' || !claims.sid) return null
    return `${claims.id}:${claims.sid}`
}

export function sessionKey(user) {
    return tokenSessionKey(user?.token) || 'anonymous'
}

export function sameSessionToken(first, second) {
    const key = tokenSessionKey(first)
    return Boolean(key && key === tokenSessionKey(second))
}

export function renewedSession(user, token) {
    if (!user || !sameSessionToken(user.token, token)) return user
    const previous = tokenClaims(user.token)
    const next = tokenClaims(token)
    // Respuestas simultáneas o tardías no deben reemplazar un token más nuevo.
    if (!Number.isFinite(next?.iat) || !Number.isFinite(next?.exp) ||
        next.iat <= previous?.iat || next.exp <= previous?.exp) return user
    return { ...user, token }
}

export function authErrorMessage(error) {
    if (error?.response?.status === 429) {
        const seconds = Number(error.response.headers?.['retry-after'] ?? error.response.data?.body?.retryAfter);
        if (Number.isFinite(seconds) && seconds > 0) {
            const minutes = Math.ceil(seconds / 60);
            return `Demasiados intentos. Vuelve a intentarlo en ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}.`;
        }
        return 'Demasiados intentos. Espera unos minutos antes de volver a intentarlo.';
    }
    return error?.response?.data?.body?.message || error?.message || 'No se pudo completar la solicitud.';
}

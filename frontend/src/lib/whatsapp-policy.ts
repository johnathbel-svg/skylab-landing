const CUSTOMER_SERVICE_WINDOW_MS = 24 * 60 * 60 * 1000

export function isInsideWhatsAppCustomerWindow(lastInboundAt?: string | null, now = new Date()) {
    if (!lastInboundAt) return false

    const lastInboundTime = new Date(lastInboundAt).getTime()
    if (Number.isNaN(lastInboundTime)) return false

    return now.getTime() - lastInboundTime <= CUSTOMER_SERVICE_WINDOW_MS
}

export function getWhatsAppWindowState(lastInboundAt?: string | null, now = new Date()) {
    const insideWindow = isInsideWhatsAppCustomerWindow(lastInboundAt, now)

    if (!lastInboundAt) {
        return {
            insideWindow,
            label: 'Sin ventana activa',
            detail: 'El contacto debe escribir primero o se debe usar una plantilla aprobada por Meta.'
        }
    }

    return {
        insideWindow,
        label: insideWindow ? 'Ventana activa' : 'Ventana cerrada',
        detail: insideWindow
            ? 'Se permite respuesta libre porque el usuario escribio en las ultimas 24 horas.'
            : 'Ya pasaron mas de 24 horas; solo se pueden usar plantillas aprobadas por Meta.'
    }
}

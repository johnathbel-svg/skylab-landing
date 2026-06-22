import crypto from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12

function getEncryptionKey() {
    const rawKey = process.env.INTEGRATION_ENCRYPTION_KEY || process.env.WHATSAPP_ENCRYPTION_KEY

    if (!rawKey) {
        throw new Error('Falta INTEGRATION_ENCRYPTION_KEY para cifrar credenciales.')
    }

    if (/^[a-f0-9]{64}$/i.test(rawKey)) {
        return Buffer.from(rawKey, 'hex')
    }

    try {
        const base64Key = Buffer.from(rawKey, 'base64')
        if (base64Key.length === 32) return base64Key
    } catch {
        // Fall back to a stable hash below.
    }

    return crypto.createHash('sha256').update(rawKey).digest()
}

export function encryptSecret(secret: string) {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv)
    const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()])
    const tag = cipher.getAuthTag()

    return `v1:${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`
}

export function decryptSecret(payload?: string | null) {
    if (!payload) return null

    if (!payload.startsWith('v1:')) {
        throw new Error('Formato de credencial cifrada no soportado.')
    }

    const [, ivBase64, tagBase64, encryptedBase64] = payload.split(':')
    if (!ivBase64 || !tagBase64 || !encryptedBase64) {
        throw new Error('Credencial cifrada incompleta.')
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), Buffer.from(ivBase64, 'base64'))
    decipher.setAuthTag(Buffer.from(tagBase64, 'base64'))

    return Buffer.concat([
        decipher.update(Buffer.from(encryptedBase64, 'base64')),
        decipher.final()
    ]).toString('utf8')
}

export function maskSecret(secret?: string | null) {
    if (!secret) return ''
    if (secret.length <= 10) return '••••••'
    return `${secret.slice(0, 6)}••••${secret.slice(-4)}`
}

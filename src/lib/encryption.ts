import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-do-not-use-in-production'

export function encryptToken(token: string): string {
  return CryptoJS.AES.encrypt(token, ENCRYPTION_KEY).toString()
}

export function decryptToken(encryptedToken: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedToken, ENCRYPTION_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}

export function hashToken(token: string): string {
  return CryptoJS.SHA256(token).toString()
}

// Validate token format and expiration
export function isTokenValid(token: string): boolean {
  try {
    // Add your token validation logic here
    // For example, check if it's a valid JWT and not expired
    return token.length > 0
  } catch (error) {
    return false
  }
}

// Generate a random key for encryption
export function generateEncryptionKey(): string {
  return CryptoJS.lib.WordArray.random(32).toString()
} 
import * as crypto from "node:crypto"

const ALGORITHM = "aes-256-cbc"
const IV_LENGTH = 16
const KEY_LENGTH = 32

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY
  if (!raw || raw.length < 32) {
    throw new Error(
      "ENCRYPTION_KEY must be set and at least 32 bytes (e.g. run: openssl rand -base64 32)"
    )
  }
  const key = Buffer.from(raw, "base64")
  if (key.length !== KEY_LENGTH) {
    throw new Error(
      `ENCRYPTION_KEY must decode to exactly ${KEY_LENGTH} bytes (base64). Got ${key.length}.`
    )
  }
  return key
}

/**
 * Encrypt plaintext with AES-256-CBC.
 * @returns Single string "ivHex:encryptedHex" for storage.
 */
export function encrypt(text: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const enc = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ])
  return `${iv.toString("hex")}:${enc.toString("hex")}`
}

/**
 * Decrypt a string produced by encrypt() ("iv:encryptedHex").
 * @returns Plaintext string.
 */
export function decrypt(encrypted: string): string {
  const key = getKey()
  const idx = encrypted.indexOf(":")
  if (idx === -1) {
    throw new Error('Invalid encrypted format: expected "iv:encryptedHex"')
  }
  const ivHex = encrypted.slice(0, idx)
  const encHex = encrypted.slice(idx + 1)
  const iv = Buffer.from(ivHex, "hex")
  const enc = Buffer.from(encHex, "hex")
  if (iv.length !== IV_LENGTH) {
    throw new Error(`Invalid IV length: expected ${IV_LENGTH} bytes`)
  }
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString(
    "utf8"
  )
}

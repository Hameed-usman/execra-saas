import * as cryptoJs from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-secret-key';

export function encrypt(text: string): string {
  return cryptoJs.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

export function decrypt(ciphertext: string): string {
  const bytes = cryptoJs.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(cryptoJs.enc.Utf8);
}

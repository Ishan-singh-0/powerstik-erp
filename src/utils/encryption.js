import CryptoJS from 'crypto-js';

// The encryption key should ideally come from an environment variable
// but for the client-side demo we use a static master key. 
// In a real production app with user logins, this would be derived from the user's password.
const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'PowerStik-Secure-Key-2026';

/**
 * Encrypts a JSON object into a secure AES-encrypted string
 * @param {Object} data - The data to encrypt
 * @returns {string} Encrypted ciphertext
 */
export const encryptData = (data) => {
  try {
    const jsonString = JSON.stringify(data);
    const ciphertext = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
    return ciphertext;
  } catch (error) {
    console.error('Encryption failed:', error);
    return null;
  }
};

/**
 * Decrypts an AES-encrypted string back into a JSON object
 * @param {string} ciphertext - The encrypted string
 * @returns {Object|null} Decrypted data object or null if failed
 */
export const decryptData = (ciphertext) => {
  try {
    if (!ciphertext) return null;
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

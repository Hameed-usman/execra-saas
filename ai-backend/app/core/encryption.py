import base64
import hashlib
from Crypto.Cipher import AES
from app.core.config import settings

def derive_key_and_iv(password, salt, key_len, iv_len):
    """
    Derives key and IV from password and salt using OpenSSL's EVP_BytesToKey-like algorithm.
    This is what crypto-js uses by default.
    """
    dtot = b""
    last = b""
    while len(dtot) < key_len + iv_len:
        m = hashlib.md5()
        m.update(last + password + salt)
        last = m.digest()
        dtot += last
    return dtot[:key_len], dtot[key_len:key_len + iv_len]

def decrypt(ciphertext_b64: str, passphrase: str) -> str:
    """
    Decrypts a base64 encoded AES ciphertext that was encrypted with crypto-js using a passphrase.
    """
    data = base64.b64decode(ciphertext_b64)
    if data[:8] != b'Salted__':
        raise ValueError("Invalid ciphertext format (missing Salted__ prefix)")
    
    salt = data[8:16]
    encrypted_data = data[16:]
    
    key, iv = derive_key_and_iv(passphrase.encode('utf-8'), salt, 32, 16)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    
    decrypted_data = cipher.decrypt(encrypted_data)
    
    # Unpadding (PKCS7)
    padding_len = decrypted_data[-1]
    return decrypted_data[:-padding_len].decode('utf-8')

def decrypt_token(ciphertext: str) -> str:
    """
    Helper to decrypt tokens using the application's ENCRYPTION_KEY.
    """
    return decrypt(ciphertext, settings.ENCRYPTION_KEY)

def encrypt_token(text: str) -> str:
    """
    Helper to encrypt tokens using the application's ENCRYPTION_KEY.
    Matches CryptoJS format used by the frontend.
    """
    import base64
    import os
    from Crypto.Cipher import AES
    from Crypto.Util.Padding import pad
    
    salt = os.urandom(8)
    key, iv = derive_key_and_iv(settings.ENCRYPTION_KEY.encode('utf-8'), salt, 32, 16)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    
    ct_bytes = cipher.encrypt(pad(text.encode('utf-8'), AES.block_size))
    result = b'Salted__' + salt + ct_bytes
    return base64.b64encode(result).decode('utf-8')

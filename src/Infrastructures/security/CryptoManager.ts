import { type AES, enc } from 'crypto-js'
import CryptManager from '../../Applications/security/CryptManager'
import { Config } from '../../Commons/config/server-config'

class CryptoManager extends CryptManager {
  constructor(private readonly cipher: typeof AES) {
    super()
  }

  encrypt(data: string): string {
    return this.cipher.encrypt(data, Config.instance.cryptKey).toString()
  }

  decrypt(data: string): string {
    const bytes = this.cipher.decrypt(data, Config.instance.cryptKey)
    const decrypted = bytes.toString(enc.Utf8)
    return decrypted
  }
}

export default CryptoManager

import { type token } from '@hapi/jwt'
import AuthenticationTokenManager, { type TokenPayload } from '../../Applications/security/AuthenticationTokenManager'
import type CryptManager from '../../Applications/security/CryptManager'
import { Config } from '../../Commons/config/server-config'
import InvariantError from '../../Commons/exceptions/InvariantError'
import { INVALID_REFRESH_TOKEN } from '../../Commons/exceptions/messages/ErrorMessages'

class JwTokenManager extends AuthenticationTokenManager {
  constructor(
    private readonly jwt: typeof token,
    private readonly cryptManager: CryptManager
  ) {
    super()
  }

  createRefreshToken(payload: TokenPayload): string {
    const encryptedId = this.cryptManager.encrypt(payload.id)
    const decodedPayload: TokenPayload = { id: encryptedId }
    return this.jwt.generate(decodedPayload, Config.instance.refreshTokenKey)
  }

  createAccessToken(payload: TokenPayload): string {
    const encryptedId = this.cryptManager.encrypt(payload.id)
    const decodedPayload: TokenPayload = { id: encryptedId }
    return this.jwt.generate(decodedPayload, Config.instance.accessTokenKey)
  }

  verifyRefreshToken(token: string): void {
    try {
      const artifacts = this.jwt.decode(token)
      this.jwt.verify(artifacts, Config.instance.refreshTokenKey)
    } catch (error) {
      throw new InvariantError(INVALID_REFRESH_TOKEN)
    }
  }

  decodeRefreshToken(token: string): TokenPayload {
    const artifacts = this.jwt.decode(token)
    const encryptedId = artifacts.decoded.payload.id
    const decryptedId = this.cryptManager.decrypt(encryptedId)
    const payload: TokenPayload = { id: decryptedId }
    return payload
  }
}

export default JwTokenManager

export interface TokenPayload {
  id: string
}

abstract class AuthenticationTokenManager {
  abstract createRefreshToken(payload: TokenPayload): string
  abstract createAccessToken(payload: TokenPayload): string
  abstract verifyRefreshToken(token: string): void
  abstract decodeRefreshToken(token: string): TokenPayload
}

export default AuthenticationTokenManager

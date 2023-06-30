abstract class AuthenticationRepositoryBase {
  abstract addToken(token: string): Promise<void>
  abstract verifyToken(token: string): Promise<void>
  abstract deleteToken(token: string): Promise<void>
}

export default AuthenticationRepositoryBase

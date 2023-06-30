import type AuthenticationRepositoryBase from '../../../Domains/authentications/AuthenticationRepositoryBase'
import RefreshAuth, { type RefreshAuthPayload } from '../../../Domains/authentications/entities/RefreshAuth'
import type AuthenticationTokenManager from '../../security/AuthenticationTokenManager'
import { UseCaseBase } from '../UseCaseBase'

class RefreshAuthenticationUseCase extends UseCaseBase<RefreshAuthPayload, string> {
  constructor(
    private readonly authenticationRepository: AuthenticationRepositoryBase,
    private readonly tokenManager: AuthenticationTokenManager
  ) {
    super()
  }

  async execute(payload: RefreshAuthPayload): Promise<string> {
    const { refreshToken } = new RefreshAuth(payload).asObject

    this.tokenManager.verifyRefreshToken(refreshToken)
    await this.authenticationRepository.verifyToken(refreshToken)

    const { id } = this.tokenManager.decodeRefreshToken(refreshToken)

    return this.tokenManager.createAccessToken({ id })
  }
}

export default RefreshAuthenticationUseCase

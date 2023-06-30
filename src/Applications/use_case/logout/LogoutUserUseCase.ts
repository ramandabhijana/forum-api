import type AuthenticationRepositoryBase from '../../../Domains/authentications/AuthenticationRepositoryBase'
import RefreshAuth, { type RefreshAuthPayload } from '../../../Domains/authentications/entities/RefreshAuth'
import { UseCaseBase } from '../UseCaseBase'

class LogoutUserUseCase extends UseCaseBase<RefreshAuthPayload, void> {
  constructor(
    private readonly authenticationRepository: AuthenticationRepositoryBase
  ) {
    super()
  }

  async execute(payload: RefreshAuthPayload): Promise<void> {
    const { refreshToken } = new RefreshAuth(payload).asObject
    await this.authenticationRepository.verifyToken(refreshToken)
    await this.authenticationRepository.deleteToken(refreshToken)
  }
}

export default LogoutUserUseCase

import type AuthenticationRepositoryBase from '../../../Domains/authentications/AuthenticationRepositoryBase'
import NewAuth from '../../../Domains/authentications/entities/NewAuth'
import { type NewAuthPayload } from '../../../Domains/authentications/entities/NewAuth'
import type UserRepositoryBase from '../../../Domains/users/UserRepositoryBase'
import LoginUser, { type LoginUserPayload } from '../../../Domains/users/entities/LoginUser'
import type AuthenticationTokenManager from '../../security/AuthenticationTokenManager'
import type PasswordHash from '../../security/PasswordHash'
import { UseCaseBase } from '../UseCaseBase'

class LoginUserUseCase extends UseCaseBase<LoginUserPayload, NewAuthPayload> {
  constructor(
    private readonly userRepository: UserRepositoryBase,
    private readonly authenticationRepository: AuthenticationRepositoryBase,
    private readonly tokenManager: AuthenticationTokenManager,
    private readonly passwordHash: PasswordHash
  ) {
    super()
  }

  async execute(payload: LoginUserPayload): Promise<NewAuthPayload> {
    const { username, password: plainPassword } = new LoginUser(payload)
    const { id, password: encryptedPassword } = await this.userRepository.getUserByUsername(username)
    await this.passwordHash.compare(plainPassword, encryptedPassword)

    const accessToken = this.tokenManager.createAccessToken({ id })
    const refreshToken = this.tokenManager.createRefreshToken({ id })

    const newAuth = new NewAuth({ accessToken, refreshToken })

    await this.authenticationRepository.addToken(newAuth.refreshToken)

    return newAuth
  }
}

export default LoginUserUseCase

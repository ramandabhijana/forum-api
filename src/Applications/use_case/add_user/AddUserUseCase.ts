import type UserRepositoryBase from '../../../Domains/users/UserRepositoryBase'
import RegisterUser from '../../../Domains/users/entities/RegisterUser'
import { type RegisterUserPayload } from '../../../Domains/users/entities/RegisterUser'
import { type RegisteredUserPayload } from '../../../Domains/users/entities/RegisteredUser'
import type PasswordHash from '../../security/PasswordHash'
import { UseCaseBase } from '../UseCaseBase'

class AddUserUseCase extends UseCaseBase<RegisterUserPayload, RegisteredUserPayload> {
  constructor(
    private readonly userRepository: UserRepositoryBase,
    private readonly passwordHash: PasswordHash
  ) {
    super()
  }

  async execute(payload: RegisterUserPayload): Promise<RegisteredUserPayload> {
    const registerUser = new RegisterUser(payload)

    await this.userRepository.verifyAvailableUsername(registerUser.username)

    const encryptedPassword = await this.passwordHash.hash(registerUser.password)
    registerUser.password = encryptedPassword

    return await this.userRepository.addUser(registerUser)
  }
}

export default AddUserUseCase

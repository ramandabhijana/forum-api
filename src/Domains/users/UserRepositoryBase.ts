import type RegisterUser from './entities/RegisterUser'
import { type RegisteredUserPayload } from './entities/RegisteredUser'
import { type User } from './types/User'

abstract class UserRepositoryBase {
  abstract addUser(registerUser: RegisterUser): Promise<RegisteredUserPayload>
  abstract verifyAvailableUsername(username: string): Promise<void>
  abstract getUserByUsername(username: string): Promise<User>
}

export default UserRepositoryBase

import UserRepositoryBase from '../../../Domains/users/UserRepositoryBase'
import { type AppDataSource } from '../../database/data-source'
import { type Repository } from 'typeorm'
import { User } from './model/User'
import type RegisterUser from '../../../Domains/users/entities/RegisterUser'
import RegisteredUser, { type RegisteredUserPayload } from '../../../Domains/users/entities/RegisteredUser'
import { USERNAME_NOT_AVAILABLE, USER_NOT_FOUND } from '../../../Commons/exceptions/messages/ErrorMessages'
import { type User as UserDomain } from '../../../Domains/users/types/User'
import InvariantError from '../../../Commons/exceptions/InvariantError'

class UserRepository extends UserRepositoryBase {
  private readonly repository: Repository<User>

  constructor(
    dataSource: AppDataSource,
    private readonly idGenerator: () => string
  ) {
    super()
    this.repository = dataSource.instance.getRepository(User)
  }

  async addUser(registerUser: RegisterUser): Promise<RegisteredUserPayload> {
    const userId = `user-${this.idGenerator()}`

    const user = new User()
    user.id = userId
    user.username = registerUser.username
    user.fullName = registerUser.fullname
    user.password = registerUser.password

    const { id, fullName: fullname, username } = await this.repository.save(user)

    return new RegisteredUser({ id, username, fullname }).asObject
  }

  async verifyAvailableUsername(username: string): Promise<void> {
    const user = await this.repository.findOne({
      where: { username },
      select: { id: true }
    })
    if (user !== null) {
      throw new InvariantError(USERNAME_NOT_AVAILABLE)
    }
  }

  async getUserByUsername(username: string): Promise<UserDomain> {
    const user = await this.repository.findOneBy({ username })
    if (user === null) {
      throw new InvariantError(USER_NOT_FOUND)
    }
    const { fullName, id, password } = user
    return {
      id,
      username,
      fullName,
      password
    }
  }
}

export default UserRepository

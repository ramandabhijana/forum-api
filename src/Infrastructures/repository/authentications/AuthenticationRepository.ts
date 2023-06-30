import InvariantError from '../../../Commons/exceptions/InvariantError'
import { REFRESH_TOKEN_NOT_FOUND } from '../../../Commons/exceptions/messages/ErrorMessages'
import AuthenticationRepositoryBase from '../../../Domains/authentications/AuthenticationRepositoryBase'
import { type AppDataSource } from '../../database/data-source'
import { Authentication } from './model/Authentication'
import { type Repository } from 'typeorm'

class AuthenticationRepository extends AuthenticationRepositoryBase {
  private readonly repository: Repository<Authentication>

  constructor(dataSource: AppDataSource) {
    super()
    this.repository = dataSource.instance.getRepository(Authentication)
  }

  async addToken(token: string): Promise<void> {
    const authentication = new Authentication()
    authentication.token = token
    await this.repository.save(authentication)
  }

  async verifyToken(token: string): Promise<void> {
    const refreshToken = await this.repository.findOneBy({ token })
    if (refreshToken == null) throw new InvariantError(REFRESH_TOKEN_NOT_FOUND)
  }

  async deleteToken(token: string): Promise<void> {
    await this.repository.delete({ token })
  }
}

export default AuthenticationRepository

import AuthenticationRepository from '../AuthenticationRepository'
import InvariantError from '../../../../Commons/exceptions/InvariantError'
import { AppDataSource } from '../../../database/data-source'
import { Authentication } from '../model/Authentication'

describe('AuthenticationRepository', () => {
  let dataSource: AppDataSource

  beforeAll(done => {
    dataSource = new AppDataSource()
    dataSource.instance.initialize()
      .then(() => { done() })
      .catch(err => { console.log(err) })
  })

  afterEach(async () => {
    await dataSource.instance.getRepository(Authentication).clear()
  })

  afterAll(async () => {
    await dataSource.instance.dropDatabase()
    await dataSource.instance.destroy()
  })

  describe('addToken function', () => {
    it('should add token to database', async () => {
      // Arrange
      const repository = new AuthenticationRepository(dataSource)
      const token = 'token'

      // Action
      await repository.addToken(token)

      // Assert
      const resultRows = await dataSource.instance
        .getRepository(Authentication)
        .findBy({ token })

      expect(resultRows).toHaveLength(1)
      expect(resultRows.at(0)?.token).toBe(token)
    })
  })

  describe('verifyToken function', () => {
    it('should throw InvariantError if token is not available', async () => {
      // Arrange
      const repository = new AuthenticationRepository(dataSource)
      const token = 'token'

      // Action & Assert
      await expect(repository.verifyToken(token)).rejects.toThrow(InvariantError)
    })

    it('should not throw InvariantError if token is available', async () => {
      // Arrange
      const repository = new AuthenticationRepository(dataSource)
      const token = 'token'
      await dataSource.instance
        .getRepository(Authentication)
        .insert({ token })

      // Action & Assert
      await expect(repository.verifyToken(token)).resolves.not.toThrow(InvariantError)
    })
  })

  describe('deleteToken function', () => {
    it('should delete token from database', async () => {
      // Arrange
      const repository = new AuthenticationRepository(dataSource)
      const token = 'token'
      await dataSource.instance
        .getRepository(Authentication)
        .insert({ token })

      // Action
      await repository.deleteToken(token)

      // Assert
      const tokens = await dataSource.instance
        .getRepository(Authentication)
        .findBy({ token })

      expect(tokens).toHaveLength(0)
    })
  })
})

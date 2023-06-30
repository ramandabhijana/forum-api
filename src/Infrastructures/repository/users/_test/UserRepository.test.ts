import InvariantError from '../../../../Commons/exceptions/InvariantError'
import RegisterUser from '../../../../Domains/users/entities/RegisterUser'
import RegisteredUser from '../../../../Domains/users/entities/RegisteredUser'
import { AppDataSource } from '../../../database/data-source'
import UserRepository from '../UserRepository'
import { User } from '../model/User'
import { type User as DomainUser } from '../../../../Domains/users/types/User'

describe('UserRepository', () => {
  let dataSource: AppDataSource

  beforeAll(done => {
    dataSource = new AppDataSource()
    dataSource.instance.initialize()
      .then(() => { done() })
      .catch(err => { console.log(err) })
  })

  afterEach(async () => {
    await dataSource.instance.getRepository(User).delete({})
  })

  afterAll(async () => {
    await dataSource.instance.dropDatabase()
    await dataSource.instance.destroy()
  })

  describe('verifyAvailableUsername function', () => {
    it('should throw InvariantError when username is not available', async () => {
      // Arrange
      await dataSource.instance.getRepository(User).save({
        id: 'user-123',
        fullName: 'pengguna baru',
        password: 'secret',
        username: 'dicoding_id'
      })
      const repository = new UserRepository(dataSource, () => '123')

      // Action & Assert
      await expect(repository.verifyAvailableUsername('dicoding_id')).rejects.toThrowError(InvariantError)
    })

    it('should not throw InvariantError when username is available', async () => {
      // Arrange
      const repository = new UserRepository(dataSource, () => { return '' })

      // Action & Assert
      await expect(repository.verifyAvailableUsername('dicoding'))
        .resolves.not.toThrowError(InvariantError)
    })
  })

  describe('addUser function', () => {
    it('should persist a register user', async () => {
      // Arrange
      const registerUser = new RegisterUser({
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding indonesia'
      })
      const fakeIdGenerator: () => string = () => '123'
      const repository = new UserRepository(dataSource, fakeIdGenerator)

      // Action
      await repository.addUser(registerUser)

      // Assert
      const users = await dataSource.instance.getRepository(User).findBy({ id: 'user-123' })
      expect(users).toHaveLength(1)
    })

    it('should return registered user correctly', async () => {
      // Arrange
      const registerUser = new RegisterUser({
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding indonesia'
      })
      const fakeIdGenerator: () => string = () => '123'
      const repository = new UserRepository(dataSource, fakeIdGenerator)

      // Action
      const registeredUser = await repository.addUser(registerUser)

      // Assert
      expect(registeredUser).toStrictEqual(new RegisteredUser({
        id: 'user-123',
        username: 'dicoding',
        fullname: 'Dicoding indonesia'
      }).asObject)
    })
  })

  describe('getUserByUsername function', () => {
    it('should throw InvariantError when user is not found', async () => {
      // Arrange
      const repository = new UserRepository(dataSource, () => { return 'id' })

      // Action & Assert
      await expect(repository.getUserByUsername('dicoding')).rejects.toThrowError(InvariantError)
    })

    it('should return the user when user is found', async () => {
      // Arrange
      await dataSource.instance.getRepository(User).save({
        username: 'dicoding',
        fullName: 'Dicoding Indonesia',
        password: 'abc',
        id: 'user-123'
      })
      const repository = new UserRepository(dataSource, () => '')
      const expectedUser: DomainUser = {
        id: 'user-123',
        username: 'dicoding',
        fullName: 'Dicoding Indonesia',
        password: 'abc'
      }

      // Action
      const user = await repository.getUserByUsername('dicoding')

      // Assert
      expect(user).toStrictEqual(expectedUser)
    })
  })
})

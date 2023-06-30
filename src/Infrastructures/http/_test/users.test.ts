import { DomainErrorTranslator } from '../../../Commons/exceptions/DomainErrorTranslator'
import { DATA_TYPE_STRING_EXPECTED, MAX_LIMIT_CHAR, MISSING_REQUIRED_PROPERTY, USERNAME_CONTAIN_RESTRICTED_CHARACTER } from '../../../Commons/exceptions/consts/DomainErrorConsts'
import { USERNAME_NOT_AVAILABLE } from '../../../Commons/exceptions/messages/ErrorMessages'
import container from '../../container'
import { AppDataSource } from '../../database/data-source'
import { User } from '../../repository/users/model/User'
import { createServer } from '../createServer'

describe('/users endpoint', () => {
  let dataSource: AppDataSource

  beforeAll(done => {
    dataSource = new AppDataSource()
    dataSource.instance.initialize()
      .then(() => { done() })
      .catch(err => { console.log(err) })
  })

  afterAll(async () => {
    await dataSource.instance.destroy()
  })

  afterEach(async () => {
    await dataSource.instance.getRepository(User).delete({})
  })

  describe('when POST', () => {
    it('should return 201 and persist user', async () => {
      // Arrange
      const payload = {
        username: 'programmer',
        password: 'secret',
        fullname: 'DicodingIndonesia'
      }
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(201)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.addedUser).toBeDefined()
    })

    it('should return 400 if request payload does not contain required property', async () => {
      // Arrange
      const payload = {
        fullname: 'Dicoding Indonesia',
        password: 'secret'
      }
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual(`${DomainErrorTranslator.instance.dictionary.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "username")`)
    })

    it('should return 400 if request payload does not meet data type specification', async () => {
      // Arrange
      const payload = {
        username: [123],
        password: 'pass',
        fullname: 'new user'
      }
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual(`${DomainErrorTranslator.instance.dictionary.get(DATA_TYPE_STRING_EXPECTED) as string}. (property: "username")`)
    })

    it('should return 400 if username has more than 50 characters', async () => {
      // Arrange
      const payload = {
        username: 'dicodingindonesiadicodingindonesiadicodingindonesiadicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia'
      }
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual(`${DomainErrorTranslator.instance.dictionary.get(MAX_LIMIT_CHAR) as string}. (property: "username")`)
    })

    it('should return 400 if username contains restricted character', async () => {
      // Arrange
      const payload = {
        username: 'dicoding indonesia',
        password: 'secret',
        fullname: 'Dicoding Indonesia'
      }
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual(`${DomainErrorTranslator.instance.dictionary.get(USERNAME_CONTAIN_RESTRICTED_CHARACTER) as string}`)
    })

    it('should return 400 if username is unavailable', async () => {
      // Arrange
      await dataSource.instance.getRepository(User).save({
        id: 'user-123',
        fullName: 'pengguna baru',
        password: 'secret',
        username: 'dicoding'
      })
      const payload = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia'
      }
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual(USERNAME_NOT_AVAILABLE)
    })
  })
})

import AuthenticationTokenManager from '../../../Applications/security/AuthenticationTokenManager'
import { DomainErrorTranslator } from '../../../Commons/exceptions/DomainErrorTranslator'
import { DATA_TYPE_STRING_EXPECTED, MISSING_REQUIRED_PROPERTY } from '../../../Commons/exceptions/consts/DomainErrorConsts'
import { INVALID_REFRESH_TOKEN, PASSWORD_DID_NOT_MATCH, REFRESH_TOKEN_NOT_FOUND, USER_NOT_FOUND } from '../../../Commons/exceptions/messages/ErrorMessages'
import container from '../../container'
import { AppDataSource } from '../../database/data-source'
import { Authentication } from '../../repository/authentications/model/Authentication'
import { User } from '../../repository/users/model/User'
import { createServer } from '../createServer'

describe('/authentications endpoint', () => {
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
    await dataSource.instance.getRepository(Authentication).clear()
  })

  describe('When POST', () => {
    it('should return 201 and new authentication', async () => {
      // Arrange
      const payload = {
        username: 'dicoding',
        password: 'password'
      }
      const server = await createServer(container)

      /** add user */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...payload,
          fullname: 'Dicoding indonesia'
        }
      })

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(201)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.accessToken).toBeDefined()
      expect(responseJson.data.refreshToken).toBeDefined()
    }, 10_000)

    it('should return 400 if username is not found', async () => {
      // Arrange
      const payload = {
        username: 'username',
        password: 'password'
      }
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual(USER_NOT_FOUND)
    })

    it('should return 401 if password do not match', async () => {
      // Arrange
      const payload = {
        username: 'dicoding',
        password: 'password'
      }
      const server = await createServer(container)

      /** add user */
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding indonesia'
        }
      })

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(401)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual(PASSWORD_DID_NOT_MATCH)
    })

    it('should return 400 if payload is missing required property', async () => {
      // Arrange
      const payload = {
        username: 'username'
      }
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual(`${DomainErrorTranslator.instance.dictionary.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "password")`)
    })

    it('should return 400 if payload does not meet data type requirement', async () => {
      // Arrange
      const payload = {
        username: 'username',
        password: 1234
      }
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual(`${DomainErrorTranslator.instance.dictionary.get(DATA_TYPE_STRING_EXPECTED) as string}. (property: "password")`)
    })
  })

  describe('When PUT', () => {
    it('should return 200 and new access token', async () => {
      // Arrange
      const server = await createServer(container)
      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia'
        }
      })
      // login user
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret'
        }
      })
      const { data: { refreshToken } } = JSON.parse(loginResponse.payload)

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/authentications',
        payload: {
          refreshToken
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.accessToken).toBeDefined()
    })

    it('should return 400 if payload is missing refresh token', async () => {
      // Arrange
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/authentications',
        payload: {}
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual(`${DomainErrorTranslator.instance.dictionary.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "refreshToken")`)
    })

    it('should return 400 if refresh token is not of type string', async () => {
      // Arrange
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/authentications',
        payload: {
          refreshToken: 123
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual(`${DomainErrorTranslator.instance.dictionary.get(DATA_TYPE_STRING_EXPECTED) as string}. (property: "refreshToken")`)
    })

    it('should return 400 if refresh token is invalid', async () => {
      // Arrange
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/authentications',
        payload: {
          refreshToken: 'invalid_refresh_token'
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual(INVALID_REFRESH_TOKEN)
    })

    it('should return 400 if refresh token is not found in database', async () => {
      // Arrange
      const server = await createServer(container)
      const refreshToken = await container.getInstance(AuthenticationTokenManager.name).createRefreshToken({ username: 'dicoding' })

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/authentications',
        payload: {
          refreshToken
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual(REFRESH_TOKEN_NOT_FOUND)
    })
  })

  describe('When DELETE', () => {
    it('should return 200 if refresh token is valid', async () => {
      // Arrange
      const server = await createServer(container)
      const refreshToken = 'refresh_token'

      const dataSource: AppDataSource = container.getInstance(AppDataSource.name)
      await dataSource.instance.getRepository(Authentication).save({ token: refreshToken })

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/authentications',
        payload: {
          refreshToken
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')
    })

    it('should return 400 if refresh token is not found in database', async () => {
      // Arrange
      const server = await createServer(container)
      const refreshToken = 'refresh_token'

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/authentications',
        payload: {
          refreshToken
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual(REFRESH_TOKEN_NOT_FOUND)
    })

    it('should return 400 if payload is missing refresh token', async () => {
      // Arrange
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/authentications',
        payload: {}
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual(`${DomainErrorTranslator.instance.dictionary.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "refreshToken")`)
    })

    it('should return 400 if refresh token is not of type string', async () => {
      // Arrange
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/authentications',
        payload: {
          refreshToken: 123
        }
      })

      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual(`${DomainErrorTranslator.instance.dictionary.get(DATA_TYPE_STRING_EXPECTED) as string}. (property: "refreshToken")`)
    })
  })
})

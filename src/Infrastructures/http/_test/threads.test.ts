import { DomainErrorTranslator } from '../../../Commons/exceptions/DomainErrorTranslator'
import { DATA_TYPE_STRING_EXPECTED, MAX_LIMIT_CHAR, MISSING_REQUIRED_PROPERTY } from '../../../Commons/exceptions/consts/DomainErrorConsts'
import { THREAD_NOT_FOUND } from '../../../Commons/exceptions/messages/ErrorMessages'
import container from '../../container'
import { AppDataSource } from '../../database/data-source'
import { Authentication } from '../../repository/authentications/model/Authentication'
import { Comment } from '../../repository/comments/model/Comment'
import { Thread } from '../../repository/threads/model/Thread'
import { User } from '../../repository/users/model/User'
import { createServer } from '../createServer'

describe('/threads endpoint', () => {
  let dataSource: AppDataSource

  beforeAll(done => {
    dataSource = new AppDataSource()
    dataSource.instance.initialize()
      .then(() => { done() })
      .catch(err => { console.log(err) })
  })

  afterAll(async () => {
    await dataSource.instance.dropDatabase()
    await dataSource.instance.destroy()
  })

  describe('When POST', () => {
    let userId: string
    let headers: Record<string, any>

    afterEach(async () => {
      await dataSource.instance.getRepository(Thread).delete({})
    })

    afterAll(async () => {
      await dataSource.instance.getRepository(Authentication).clear()
      await dataSource.instance.getRepository(User).delete({})
    })

    beforeAll(async () => {
      const server = await createServer(container)

      /** add user */
      const payload = {
        username: 'thread_user_test',
        password: 'secret'
      }
      const addedUserResponse = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...payload,
          fullname: 'Coder'
        }
      })
      const addedUserResponseJson = JSON.parse(addedUserResponse.payload)

      userId = addedUserResponseJson.data.addedUser.id

      /** obtain the access token */
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload
      })
      const loginResponseJson = JSON.parse(loginResponse.payload)

      headers = {
        Authorization: `Bearer ${loginResponseJson.data.accessToken as string}`
      }
    })

    it('should return 201 and the added thread', async () => {
      // Arrange
      const payload = {
        title: 'Title of thread',
        body: 'Body of thread'
      }
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload,
        headers
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(201)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.addedThread.id).toBeDefined()
      expect(responseJson.data.addedThread.title).toBeDefined()
      expect(responseJson.data.addedThread.owner).toEqual(userId)
    })

    it('should return 400 if request payload does not contain required property', async () => {
      // Arrange
      const payload = {}
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload,
        headers
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual(`${DomainErrorTranslator.instance.dictionary.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "title")`)
    })

    it('should return 400 if request payload does not meet data type specification', async () => {
      // Arrange
      const payload = {
        body: false,
        title: 'The title'
      }
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload,
        headers
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual(`${DomainErrorTranslator.instance.dictionary.get(DATA_TYPE_STRING_EXPECTED) as string}. (property: "body")`)
    })

    it('should return 400 if title does not meet character limit specification', async () => {
      // Arrange
      const payload = {
        title: 'titletitletitletitletitletitletitletitletitletitletitletitletitletitletitletitletitletitletitletitletitle',
        body: 'Body'
      }
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload,
        headers
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual(`${DomainErrorTranslator.instance.dictionary.get(MAX_LIMIT_CHAR) as string}. (property: "title")`)
    })

    it('should return 400 if body does not meet character limit specification', async () => {
      // Arrange
      const payload = {
        title: 'title',
        body: 'body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body body '
      }
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload,
        headers
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual(`${DomainErrorTranslator.instance.dictionary.get(MAX_LIMIT_CHAR) as string}. (property: "body")`)
    })

    it('should return 401 if authentication is missing', async () => {
      // Arrange
      const payload = {
        title: 'title',
        body: 'body'
      }
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload
      })

      // Assert
      expect(response.statusCode).toEqual(401)
    })
  })

  describe('When GET /threads/{threadId}', () => {
    let userId: string
    const threadId = 'thread-123'

    beforeAll(async () => {
      const server = await createServer(container)

      const payload = {
        username: 'thread_user_test',
        password: 'secret'
      }
      const addedUserResponse = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...payload,
          fullname: 'Coder'
        }
      })
      const addedUserResponseJson = JSON.parse(addedUserResponse.payload)
      userId = addedUserResponseJson.data.addedUser.id

      await dataSource.instance.getRepository(Thread).save({
        id: threadId,
        body: 'body',
        title: 'title',
        owner: { id: userId }
      })
    })

    it('should return 200 and thread detail', async () => {
      // Arrange
      const commentPayloads = ['abc', 'def', 'ghi', 'jkl', 'uvw', 'xyz'].map(id => ({ id: `comment-${id}`, createdAt: new Date(), owner: userId, threadId: 'thread-123' }))

      for (const payload of commentPayloads) {
        await dataSource.instance.getRepository(Comment).save({
          id: payload.id,
          content: 'default',
          commenter: { id: payload.owner },
          thread: { id: payload.threadId }
        })
      }

      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.thread).toBeDefined()
      expect(responseJson.data.thread.comments).toHaveLength(6)
    })

    it('should return 404 if thread does not exist', async () => {
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-klm'
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toStrictEqual(THREAD_NOT_FOUND)
    })
  })
})

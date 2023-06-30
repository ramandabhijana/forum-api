import { DomainErrorTranslator } from '../../../Commons/exceptions/DomainErrorTranslator'
import { DATA_TYPE_STRING_EXPECTED, MAX_LIMIT_CHAR, MISSING_REQUIRED_PROPERTY } from '../../../Commons/exceptions/consts/DomainErrorConsts'
import { COMMENT_NOT_FOUND, REPLY_NOT_FOUND, REPLY_OWNER_NOT_AUTHORIZED, THREAD_NOT_FOUND } from '../../../Commons/exceptions/messages/ErrorMessages'
import container from '../../container'
import { AppDataSource } from '../../database/data-source'
import { createServer } from '../createServer'

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  let dataSource: AppDataSource

  beforeAll(done => {
    dataSource = container.getInstance(AppDataSource.name)
    dataSource.instance.initialize()
      .then(() => { done() })
      .catch(err => { console.log(err) })
  }, 10_000)

  afterAll(async () => {
    await dataSource.instance.dropDatabase()
    await dataSource.instance.destroy()
  })

  describe('When POST', () => {
    let userId: string
    let threadId: string
    let commentId: string
    let headers: Record<string, any>

    beforeAll(async () => {
      const server = await createServer(container)

      /** add user */
      const payload = {
        username: 'user_test',
        password: 'secret'
      }
      const addedUserResponse = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...payload,
          fullname: 'Pengguna'
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

      /** add thread */
      const threadPayload = {
        title: 'Title of thread',
        body: 'Body of thread'
      }
      const addedThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadPayload,
        headers
      })
      const addedThreadResponseJson = JSON.parse(addedThreadResponse.payload)

      threadId = addedThreadResponseJson.data.addedThread.id

      /** add comment */
      const commentPayload = {
        content: 'Comment content'
      }
      const addedCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: commentPayload,
        headers
      })
      const addedCommentResponseJson = JSON.parse(addedCommentResponse.payload)

      commentId = addedCommentResponseJson.data.addedComment.id
    }, 10_000)

    it('should return 201 and the added reply', async () => {
      // Arrange
      const payload = {
        content: 'A reply'
      }
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload,
        headers
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(201)
      expect(responseJson.status).toEqual('success')
      expect(responseJson.data.addedReply.id).toBeDefined()
      expect(responseJson.data.addedReply.content).toStrictEqual('A reply')
      expect(responseJson.data.addedReply.owner).toEqual(userId)
    })

    it('should return 400 if request payload does not contain required property', async () => {
      // Arrange
      const payload = {}
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload,
        headers
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual(`${DomainErrorTranslator.instance.dictionary.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "content")`)
    })

    it('should return 400 if request payload does not meet data type specification', async () => {
      // Arrange
      const payload = {
        content: false
      }
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload,
        headers
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual(`${DomainErrorTranslator.instance.dictionary.get(DATA_TYPE_STRING_EXPECTED) as string}. (property: "content")`)
    })

    it('should return 400 if content does not meet character limit specification', async () => {
      // Arrange
      const payload = {
        content: 'balasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalas'
      }
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload,
        headers
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual(`${DomainErrorTranslator.instance.dictionary.get(MAX_LIMIT_CHAR) as string}. (property: "content")`)
    })

    it('should return 401 if authentication is missing', async () => {
      // Arrange
      const payload = {
        content: 'a reply'
      }
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload
      })

      // Assert
      expect(response.statusCode).toEqual(401)
    })

    it('should return 404 if thread with given id does not exist', async () => {
      // Arrange
      const payload = {
        content: 'a reply'
      }
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/thread-xyz/comments/${commentId}/replies`,
        payload,
        headers
      })

      // Assert
      expect(response.statusCode).toEqual(404)
      expect(JSON.parse(response.payload).message).toEqual(THREAD_NOT_FOUND)
    })

    it('should return 404 if comment with given id does not exist', async () => {
      // Arrange
      const payload = {
        content: 'a reply'
      }
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/comment-404/replies`,
        payload,
        headers
      })

      // Assert
      expect(response.statusCode).toEqual(404)
      expect(JSON.parse(response.payload).message).toEqual(COMMENT_NOT_FOUND)
    })
  })

  describe('When DELETE /{replyId}', () => {
    let threadId: string
    let commentId: string
    let replyId: string
    let headers: Record<string, any>

    beforeAll(async () => {
      const server = await createServer(container)

      /** add user */
      const payload = {
        username: 'user_test',
        password: 'secret'
      }
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...payload,
          fullname: 'Pengguna'
        }
      })

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

      /** add thread */
      const threadPayload = {
        title: 'Title of thread',
        body: 'Body of thread'
      }
      const addedThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: threadPayload,
        headers
      })
      const addedThreadResponseJson = JSON.parse(addedThreadResponse.payload)

      threadId = addedThreadResponseJson.data.addedThread.id

      /** add comment */
      const commentPayload = {
        content: 'A comment'
      }
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: commentPayload,
        headers
      })
      const commentResponseJson = JSON.parse(commentResponse.payload)

      commentId = commentResponseJson.data.addedComment.id

      /** add reply */
      const replyPayload = { content: 'A reply' }
      const replyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: replyPayload,
        headers
      })
      const replyResponseJson = JSON.parse(replyResponse.payload)

      replyId = replyResponseJson.data.addedReply.id
    }, 10_000)

    it('should return 401 if authentication is missing', async () => {
      // Arrange
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`
      })

      // Assert
      expect(response.statusCode).toEqual(401)
    })

    it('should return 404 if thread does not exist', async () => {
      // Arrange
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/thread-404/comments/${commentId}/replies/${replyId}`,
        headers
      })

      // Assert
      expect(response.statusCode).toEqual(404)
      expect(JSON.parse(response.payload).message).toEqual(THREAD_NOT_FOUND)
    })

    it('should return 404 if comment does not exist', async () => {
      // Arrange
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/comment-404/replies/${replyId}`,
        headers
      })

      // Assert
      expect(response.statusCode).toEqual(404)
      expect(JSON.parse(response.payload).message).toEqual(COMMENT_NOT_FOUND)
    })

    it('should return 404 if reply does not exist', async () => {
      // Arrange
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/reply-404`,
        headers
      })

      // Assert
      expect(response.statusCode).toEqual(404)
      expect(JSON.parse(response.payload).message).toEqual(REPLY_NOT_FOUND)
    })

    it('should return 403 if user is not the owner', async () => {
      // Arrange
      const server = await createServer(container)

      const payload = {
        username: 'unique',
        password: 'secret'
      }
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          ...payload,
          fullname: 'Pengguna'
        }
      })
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload
      })
      const loginResponseJson = JSON.parse(loginResponse.payload)

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${loginResponseJson.data.accessToken as string}`
        }
      })

      // Assert
      expect(response.statusCode).toEqual(403)
      expect(JSON.parse(response.payload).message).toEqual(REPLY_OWNER_NOT_AUTHORIZED)
    })

    it('should return 200 and success status', async () => {
      // Arrange
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')
    })
  })
})

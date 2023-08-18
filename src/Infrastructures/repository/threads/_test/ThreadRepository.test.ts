import NotFoundError from '../../../../Commons/exceptions/NotFoundError'
import AddedThread from '../../../../Domains/threads/entities/AddedThread'
import NewThread from '../../../../Domains/threads/entities/NewThread'
import { AppDataSource } from '../../../database/data-source'
import { User } from '../../users/model/User'
import ThreadRepository from '../ThreadRepository'
import { type ThreadWithUsernamePayload } from '../../../../Domains/threads/entities/ThreadWithUsername'
import { Thread } from '../model/Thread'
import { type CommentWithUsernamePayload } from '../../../../Domains/comments/entities/CommentWithUsername'
import { Comment } from '../../comments/model/Comment'
import { type DetailedThreadPayload } from '../../../../Domains/threads/entities/DetailedThread'

describe('ThreadRepository', () => {
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

  describe('addThread function', () => {
    const userId = 'user-abcd'
    beforeAll(async () => {
      await dataSource.instance.getRepository(User).save({
        id: userId,
        fullName: 'pengguna baru',
        password: 'secret',
        username: 'threaduser'
      })
    })

    afterAll(async () => {
      await dataSource.instance.getRepository(Thread).delete({})
      await dataSource.instance.getRepository(User).delete({ id: userId })
    })

    it('should persist a new thread', async () => {
      // Arrange
      const { title, body } = new NewThread({
        title: 'test',
        body: 'test',
        userId
      }).asObject
      const fakeIdGenerator: () => string = () => '123'
      const repository = new ThreadRepository(dataSource, fakeIdGenerator)

      // Action
      await repository.addThread(title, body, userId)

      // Assert
      const threads = await dataSource.instance.getRepository(Thread).findBy({ id: 'thread-123' })
      expect(threads).toHaveLength(1)
    })

    it('should return added thread correctly', async () => {
      // Arrange
      const { title, body } = new NewThread({
        title: 'test',
        body: 'test',
        userId
      }).asObject
      const fakeIdGenerator: () => string = () => '456'
      const repository = new ThreadRepository(dataSource, fakeIdGenerator)

      // Action
      const addedThread = await repository.addThread(title, body, userId)

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-456',
        title: 'test',
        owner: 'user-abcd'
      }).asObject)
    })
  })

  describe('verifyThreadExists function', () => {
    const threadId = 'thread-404'
    it('should throw NotFoundError when thread is not found', async () => {
      // Arrange
      const repository = new ThreadRepository(dataSource, () => 'id')

      // Action & Assert
      await expect(repository.verifyThreadExists(threadId)).rejects.toThrow(NotFoundError)
    })

    it('should not throw NotFoundError when thread is found', async () => {
      // Arrange
      await dataSource.instance.getRepository(User).save({
        id: 'user-456',
        fullName: 'pengguna baru',
        password: 'secret',
        username: 'thread_user'
      })
      await dataSource.instance.getRepository(Thread).save({
        id: threadId,
        body: 'body',
        title: 'title',
        owner: { id: 'user-456' }
      })
      await dataSource.instance.getRepository(Thread).findBy({ id: threadId })
      const repository = new ThreadRepository(dataSource, () => 'id')

      // Action & Assert
      await expect(repository.verifyThreadExists(threadId)).resolves.not.toThrow(NotFoundError)
    })
  })

  describe('getThreadWithUsernameById function', () => {
    it('should return the correct thread', async () => {
      // Arrange
      await dataSource.instance.getRepository(User).save({
        id: 'user-abcd',
        fullName: 'pengguna baru',
        password: 'secret',
        username: 'new-user'
      })
      const threadCreationDate = new Date()
      await dataSource.instance.getRepository(Thread).save({
        id: 'thread-456',
        title: 'title of thread',
        body: 'body of thread',
        owner: { id: 'user-abcd' },
        createdAt: threadCreationDate
      })
      const expectedThread: ThreadWithUsernamePayload = {
        id: 'thread-456',
        title: 'title of thread',
        body: 'body of thread',
        date: threadCreationDate,
        username: 'new-user'
      }

      const repository = new ThreadRepository(dataSource, () => 'id')

      // Action
      const thread = await repository.getThreadWithUsernameById('thread-456')

      // Assert
      expect(thread).toStrictEqual(expectedThread)
    })

    it('should throw NotFoundError when thread does not exist', async () => {
      // Arrange
      const repository = new ThreadRepository(dataSource, () => { return 'id' })

      // Action & Assert
      await expect(repository.getThreadWithUsernameById('thread-def')).rejects.toThrowError(NotFoundError)
    })
  })

  describe('getThreadCommentsById function', () => {
    const userId = 'user-abcd'
    const username = 'new-user'
    const threadId = 'thread-456'
    const threadCreationDate = new Date()

    beforeAll(async () => {
      await dataSource.instance.getRepository(Thread).save({
        id: threadId,
        title: 'title of thread',
        body: 'body of thread',
        owner: { id: userId },
        createdAt: threadCreationDate
      })
      const comments: CommentWithUsernamePayload[] = [
        {
          id: 'comment-xyz',
          content: 'a comment',
          username,
          date: new Date('2022-03-03'),
          likeCount: 0
        },
        {
          id: 'comment-abc',
          content: 'a comment',
          username,
          date: new Date('2022-03-06'),
          likeCount: 0
        },
        {
          id: 'comment-def',
          content: 'a comment',
          username,
          date: new Date('2022-03-05'),
          likeCount: 0
        }
      ]
      for (const comment of comments) {
        await dataSource.instance.getRepository(Comment).save({
          ...comment,
          createdAt: comment.date,
          commenter: { id: userId },
          thread: { id: threadId }
        })
      }
    })

    afterAll(async () => {
      await dataSource.instance.getRepository(Comment).delete({})
      await dataSource.instance.getRepository(Thread).delete({})
      await dataSource.instance.getRepository(User).delete({ id: userId })
    })

    it('should return thread with comments properly', async () => {
      // Arrange
      const expectedThread: DetailedThreadPayload = {
        id: 'thread-456',
        title: 'title of thread',
        body: 'body of thread',
        date: threadCreationDate,
        username: 'new-user',
        comments: [
          {
            id: 'comment-xyz',
            content: 'a comment',
            username,
            date: new Date('2022-03-03'),
            replies: [],
            likeCount: 0
          },
          {
            id: 'comment-def',
            content: 'a comment',
            username,
            date: new Date('2022-03-05'),
            replies: [],
            likeCount: 0
          },
          {
            id: 'comment-abc',
            content: 'a comment',
            username,
            date: new Date('2022-03-06'),
            replies: [],
            likeCount: 0
          }
        ]
      }
      const repository = new ThreadRepository(dataSource, () => '')

      // Action
      const thread = await repository.getThreadCommentsById(threadId)

      // Assert
      expect(thread).toStrictEqual(expectedThread)
    })

    it('should return comments with appropriate amount as requested', async () => {
      // Arrange
      const repository = new ThreadRepository(dataSource, () => '')

      // Action
      const threadCommentsWithLimit = await repository.getThreadCommentsById(threadId, { limit: 2 })
      const threadCommentsWithOffset = await repository.getThreadCommentsById(threadId, { offset: 2 }) // there's only 3 comments

      // Assert
      expect(threadCommentsWithLimit.comments).toHaveLength(2)
      expect(threadCommentsWithOffset.comments).toHaveLength(1)
    })

    it('should include comment that has been soft deleted', async () => {
      // Arrange
      const count = (await dataSource.instance.getRepository(Comment).findBy({ thread: { id: threadId } })).length
      await dataSource.instance.getRepository(Comment).softDelete({ id: 'comment-abc' })

      const repository = new ThreadRepository(dataSource, () => '')

      // Action
      const thread = await repository.getThreadCommentsById(threadId)

      // Assert
      expect(thread.comments).toHaveLength(count)
    })

    it('should throw not found when thread does not exist', async () => {
      // Arrange
      const repository = new ThreadRepository(dataSource, () => { return 'id' })

      // Action & Assert
      await expect(repository.getThreadCommentsById('thread-zzz')).rejects.toThrowError(NotFoundError)
    })
  })
})

import NotFoundError from '../../../../Commons/exceptions/NotFoundError'
import AddedThread from '../../../../Domains/threads/entities/AddedThread'
import NewThread from '../../../../Domains/threads/entities/NewThread'
import { AppDataSource } from '../../../database/data-source'
import { User } from '../../users/model/User'
import ThreadRepository from '../ThreadRepository'
import { type ThreadWithUsernamePayload } from '../../../../Domains/threads/entities/ThreadWithUsername'
import { Thread } from '../model/Thread'

describe('ThreadRepository', () => {
  let dataSource: AppDataSource

  beforeAll(done => {
    dataSource = new AppDataSource()
    dataSource.instance.initialize()
      .then(() => { done() })
      .catch(err => { console.log(err) })
  })

  afterEach(async () => {
    await dataSource.instance.getRepository(Thread).delete({})
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
        username: 'threaduser'
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
})

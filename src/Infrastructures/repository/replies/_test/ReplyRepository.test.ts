import AuthorizationError from '../../../../Commons/exceptions/AuthorizationError'
import NotFoundError from '../../../../Commons/exceptions/NotFoundError'
import { AppDataSource } from '../../../database/data-source'
import { Thread } from '../../threads/model/Thread'
import { User } from '../../users/model/User'
import { Comment } from '../../comments/model/Comment'
import { Reply } from '../model/Reply'
import ReplyRepository from '../ReplyRepository'
import NewReply from '../../../../Domains/replies/entities/NewReply'
import AddedReply from '../../../../Domains/replies/entities/AddedReply'
import { type ReplyWithUsernamePayload } from '../../../../Domains/replies/entities/ReplyWithUsername'

describe('ReplyRepository', () => {
  let dataSource: AppDataSource

  beforeAll(done => {
    dataSource = new AppDataSource()
    dataSource.instance.initialize()
      .then(() => { done() })
      .catch(err => { console.log(err) })
  })

  afterEach(async () => {
    await dataSource.instance.getRepository(Reply).delete({})
  })

  afterAll(async () => {
    await dataSource.instance.dropDatabase()
    await dataSource.instance.destroy()
  })

  describe('addReply function', () => {
    const userId = 'user-abcd'
    const threadId = 'thread-123'
    const commentId = 'comment-123'

    beforeAll(async () => {
      await dataSource.instance.getRepository(User).save({
        id: userId,
        fullName: 'pengguna baru',
        password: 'secret',
        username: 'username'
      })
      await dataSource.instance.getRepository(Thread).save({
        id: threadId,
        body: 'sebuah thread',
        title: 'judul',
        owner: { id: userId }
      })
      await dataSource.instance.getRepository(Comment).save({
        id: commentId,
        content: 'sebuah komentar',
        commenter: { id: userId },
        thread: { id: threadId }
      })
    })

    afterAll(async () => {
      await dataSource.instance.getRepository(Comment).delete({ id: commentId })
      await dataSource.instance.getRepository(Thread).delete({ id: threadId })
      await dataSource.instance.getRepository(Thread).delete({ id: threadId })
      await dataSource.instance.getRepository(User).delete({ id: userId })
    })

    it('should persist a new reply', async () => {
      // Arrange
      const repository = new ReplyRepository(dataSource, () => '123')
      const reply = new NewReply({
        content: 'sebuah balasan',
        commentId,
        threadId,
        userId
      })

      // Action
      await repository.addReply(reply.content, reply.commentId, reply.userId)

      // Assert
      const resultRows = await dataSource.instance
        .getRepository(Reply)
        .findBy({ id: 'reply-123' })

      expect(resultRows).toHaveLength(1)
    })

    it('should return added reply correctly', async () => {
      // Arrange
      const repository = new ReplyRepository(dataSource, () => '123')
      const reply = new NewReply({
        content: 'sebuah balasan',
        commentId,
        threadId,
        userId
      })

      // Action
      const addedReply = await repository.addReply(reply.content, reply.commentId, reply.userId)

      // Assert
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: 'sebuah balasan',
        owner: userId
      }).asObject)
    })
  })

  describe('verifyReplyExists function', () => {
    const replyId = 'reply-404'

    it('should throw NotFoundError when reply does not exist', async () => {
      // Arrange
      const repository = new ReplyRepository(dataSource, () => 'id')

      // Action & Assert
      await expect(repository.verifyReplyExists(replyId)).rejects.toThrow(NotFoundError)
    })

    it('should not throw NotFoundError when reply exists', async () => {
      // Arrange
      await dataSource.instance.getRepository(User).save({
        id: 'user-123',
        fullName: 'pengguna baru',
        password: 'secret',
        username: 'programmer'
      })
      await dataSource.instance.getRepository(Thread).save({
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'badan',
        owner: { id: 'user-123' }
      })
      await dataSource.instance.getRepository(Comment).save({
        id: 'comment-123',
        content: 'komentar',
        commenter: { id: 'user-123' },
        thread: { id: 'thread-123' }
      })
      await dataSource.instance.getRepository(Reply).save({
        id: replyId,
        content: 'balasan',
        replier: { id: 'user-123' },
        comment: { id: 'comment-123' }
      })
      const repository = new ReplyRepository(dataSource, () => 'id')

      // Action & Assert
      await expect(repository.verifyReplyExists(replyId)).resolves.not.toThrow(NotFoundError)
    })

    it('should throw NotFoundError when reply has been soft deleted', async () => {
      // Arrange
      await dataSource.instance.getRepository(Reply).softDelete({ id: replyId })
      const repository = new ReplyRepository(dataSource, () => 'id')

      // Action & Assert
      await expect(repository.verifyReplyExists(replyId)).rejects.toThrow(NotFoundError)
    })
  })

  describe('verifyReplyOwner function', () => {
    const userId = 'user-123'
    const threadId = 'thread-123'
    const commentId = 'comment-123'
    const replyId = 'reply-123'

    beforeAll(async () => {
      await dataSource.instance.getRepository(User).save({
        id: userId,
        fullName: 'pengguna baru',
        password: 'secret',
        username: 'username'
      })

      await dataSource.instance.getRepository(Thread).save({
        id: threadId,
        title: 'sebuah thread',
        body: 'badan',
        owner: { id: userId }
      })

      await dataSource.instance.getRepository(Comment).save({
        id: commentId,
        content: 'komentar',
        commenter: { id: 'user-123' },
        thread: { id: 'thread-123' }
      })
    })

    afterAll(async () => {
      await dataSource.instance.getRepository(Comment).delete({ id: commentId })
      await dataSource.instance.getRepository(Thread).delete({ id: threadId })
      await dataSource.instance.getRepository(User).delete({ id: userId })
    })

    it('should throw NotFoundError when reply does not exist', async () => {
      // Arrange
      const repository = new ReplyRepository(dataSource, () => '')

      // Action & Assert
      await expect(repository.verifyReplyOwner('reply-xyz', userId)).rejects.toThrowError(NotFoundError)
    })

    it('should throw AuthorizationError when owner is invalid', async () => {
      // Arrange
      await dataSource.instance.getRepository(Reply).save({
        id: replyId,
        content: 'balasan',
        replier: { id: userId },
        comment: { id: commentId }
      })
      const repository = new ReplyRepository(dataSource, () => '')

      // Action & Assert
      await expect(repository.verifyReplyOwner(replyId, 'user-xyz')).rejects.toThrowError(AuthorizationError)
    })

    it('should not throw AuthorizationError when owner is valid', async () => {
      // Arrange
      await dataSource.instance.getRepository(Reply).save({
        id: replyId,
        content: 'komentar',
        replier: { id: userId },
        comment: { id: commentId }
      })
      const repository = new ReplyRepository(dataSource, () => '')

      // Action & Assert
      await expect(repository.verifyReplyOwner(replyId, userId)).resolves.not.toThrowError(AuthorizationError)
    })
  })

  describe('getRepliesWithUsernameByCommentId function', () => {
    const userId = 'user-xyz'
    const threadId = 'thread-xyz'
    const commentId = 'comment-xyz'
    const username = 'pengguna'

    beforeAll(async () => {
      await dataSource.instance.getRepository(User).save({
        id: userId,
        fullName: 'pengguna',
        password: 'secret',
        username
      })
      await dataSource.instance.getRepository(Thread).save({
        id: threadId,
        body: 'sebuah thread',
        title: 'judul',
        owner: { id: userId }
      })
      await dataSource.instance.getRepository(Comment).save({
        id: commentId,
        content: 'sebuah komentar',
        commenter: { id: userId },
        thread: { id: threadId }
      })
    })

    afterAll(async () => {
      await dataSource.instance.getRepository(Comment).delete({ id: commentId })
      await dataSource.instance.getRepository(Thread).delete({ id: threadId })
      await dataSource.instance.getRepository(User).delete({ id: userId })
    })

    it('should return replies with original content when not deleted', async () => {
      // Arrange
      const expectedReplies: ReplyWithUsernamePayload[] = [
        {
          id: 'reply-xyz',
          content: 'a reply',
          username,
          date: new Date('2022-03-03')
        },
        {
          id: 'reply-abc',
          content: 'a reply',
          username,
          date: new Date('2022-03-04')
        },
        {
          id: 'reply-def',
          content: 'a reply',
          username,
          date: new Date('2022-03-05')
        },
        {
          id: 'reply-ghi',
          content: 'a reply',
          username,
          date: new Date('2022-03-06')
        }
      ]

      for (const reply of expectedReplies) {
        await dataSource.instance.getRepository(Reply).save({
          ...reply,
          createdAt: reply.date,
          replier: { id: userId },
          comment: { id: commentId }
        })
      }

      const repository = new ReplyRepository(dataSource, () => '')

      // Action
      const replies = await repository.getRepliesWithUsernameByCommentId(commentId)

      // Assert
      expect(replies).toEqual(expectedReplies)
    })

    it('should include reply(s) that has been soft deleted', async () => {
      // Arrange
      const repliesPayload: ReplyWithUsernamePayload[] = [
        {
          id: 'reply-xyz',
          content: 'a reply',
          username,
          date: new Date('2022-03-03')
        },
        {
          id: 'reply-abc',
          content: 'a reply',
          username,
          date: new Date('2022-03-04')
        }
      ]
      for (const reply of repliesPayload) {
        await dataSource.instance.getRepository(Reply).save({
          ...reply,
          createdAt: reply.date,
          replier: { id: userId },
          comment: { id: commentId }
        })
      }
      const repository = new ReplyRepository(dataSource, () => 'id')

      // Action
      await repository.deleteReply('reply-abc')
      const comments = await repository.getRepliesWithUsernameByCommentId(commentId)

      // Assert
      expect(comments.length).toEqual(repliesPayload.length)
    })

    it('should return empty list when a comment has no replies', async () => {
      // Arrange
      await dataSource.instance.getRepository(Reply).delete({
        comment: { id: commentId }
      })
      const repository = new ReplyRepository(dataSource, () => 'id')

      // Action
      const comments = (await repository.getRepliesWithUsernameByCommentId(commentId))

      // Assert
      expect(comments).toEqual([])
    })

    it('should return replies with appropriate amount as requested', async () => {
      // Arrange
      const replies: ReplyWithUsernamePayload[] = [
        {
          id: 'reply-xyz',
          content: 'a reply',
          username,
          date: new Date('2022-03-03')
        },
        {
          id: 'reply-abc',
          content: 'a reply',
          username,
          date: new Date('2022-03-04')
        },
        {
          id: 'reply-def',
          content: 'a reply',
          username,
          date: new Date('2022-03-05')
        },
        {
          id: 'reply-ghi',
          content: 'a reply',
          username,
          date: new Date('2022-03-06')
        }
      ]

      for (const reply of replies) {
        await dataSource.instance.getRepository(Reply).save({
          ...reply,
          createdAt: reply.date,
          replier: { id: userId },
          comment: { id: commentId }
        })
      }

      const repository = new ReplyRepository(dataSource, () => 'id')

      // Action
      const repliesWithLimit = await repository.getRepliesWithUsernameByCommentId(commentId, { limit: 3 })
      const repliesWithOffset = await repository.getRepliesWithUsernameByCommentId(commentId, { offset: 10 })

      // Assert
      expect(repliesWithLimit).toHaveLength(3)
      expect(repliesWithOffset).toHaveLength(0)
    })
  })

  describe('deleteReply function', () => {
    const userId = 'user-123'
    const threadId = 'thread-123'
    const commentId = 'thread-123'

    afterAll(async () => {
      await dataSource.instance.getRepository(Comment).delete({ id: commentId })
      await dataSource.instance.getRepository(Thread).delete({ id: threadId })
      await dataSource.instance.getRepository(User).delete({ id: userId })
    })

    it('should have deletedAt value', async () => {
      // Arrange
      const replyId = 'reply-123'
      await dataSource.instance.getRepository(User).save({
        id: userId,
        fullName: 'pengguna baru',
        password: 'secret',
        username: 'programmer'
      })
      await dataSource.instance.getRepository(Thread).save({
        id: threadId,
        title: 'sebuah thread',
        body: 'badan',
        owner: { id: userId }
      })
      await dataSource.instance.getRepository(Comment).save({
        id: commentId,
        content: 'komentar',
        commenter: { id: userId },
        thread: { id: threadId }
      })
      await dataSource.instance.getRepository(Reply).save({
        id: replyId,
        content: 'balasan',
        replier: { id: userId },
        comment: { id: commentId }
      })

      const repository = new ReplyRepository(dataSource, () => '')

      // Action
      await repository.deleteReply(replyId)

      // Assert
      const reply = await dataSource.instance.getRepository(Reply).findOne({
        withDeleted: true,
        where: { id: replyId }
      })
      expect(reply?.deletedAt).toBeDefined()
    })

    it('should throw NotFoundError when reply is not found', async () => {
      // Arrange
      const repository = new ReplyRepository(dataSource, () => '')

      // Action & Assert
      await expect(repository.deleteReply('reply-abc')).rejects.toThrowError(NotFoundError)
    })
  })
})

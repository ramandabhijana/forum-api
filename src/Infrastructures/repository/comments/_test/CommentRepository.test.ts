import AuthorizationError from '../../../../Commons/exceptions/AuthorizationError'
import NotFoundError from '../../../../Commons/exceptions/NotFoundError'
import AddedComment from '../../../../Domains/comments/entities/AddedComment'
import { type CommentWithUsernamePayload } from '../../../../Domains/comments/entities/CommentWithUsername'
import NewComment from '../../../../Domains/comments/entities/NewComment'
import { type ReplyWithUsernamePayload } from '../../../../Domains/replies/entities/ReplyWithUsername'
import { type Comments } from '../../../../Domains/threads/entities/DetailedThread'
import { AppDataSource } from '../../../database/data-source'
import { Reply } from '../../replies/model/Reply'
import { Thread } from '../../threads/model/Thread'
import { User } from '../../users/model/User'
import CommentRepository from '../CommentRepository'
import { Comment } from '../model/Comment'

describe('CommentRepository', () => {
  let dataSource: AppDataSource

  beforeAll(done => {
    dataSource = new AppDataSource()
    dataSource.instance.initialize()
      .then(() => { done() })
      .catch(err => { console.log(err) })
  })

  afterEach(async () => {
    await dataSource.instance.getRepository(Reply).clear()
    await dataSource.instance.getRepository(Comment).delete({})
  })

  afterAll(async () => {
    await dataSource.instance.dropDatabase()
    await dataSource.instance.destroy()
  })

  describe('addComment function', () => {
    const userId = 'user-abcd'
    const threadId = 'thread-123'

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
    })

    afterAll(async () => {
      await dataSource.instance.getRepository(Thread).delete({ id: threadId })
      await dataSource.instance.getRepository(User).delete({ id: userId })
    })

    it('should persist a new comment', async () => {
      // Arrange
      const repository = new CommentRepository(dataSource, () => '123')
      const comment = new NewComment({
        content: 'sebuah komentar',
        threadId,
        userId
      })

      // Action
      await repository.addComment(comment.content, comment.threadId, comment.userId)

      // Assert
      const resultRows = await dataSource.instance
        .getRepository(Comment)
        .findBy({ id: 'comment-123' })

      expect(resultRows).toHaveLength(1)
    })

    it('should return added comment correctly', async () => {
      // Arrange
      const repository = new CommentRepository(dataSource, () => '123')
      const comment = new NewComment({
        content: 'sebuah komentar',
        threadId,
        userId
      })

      // Action
      const addedComment = await repository.addComment(comment.content, comment.threadId, comment.userId)

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'sebuah komentar',
        owner: userId
      }).asObject)
    })
  })

  describe('verifyCommentExists function', () => {
    const commentId = 'comment-404'

    it('should throw NotFoundError when comment does not exist', async () => {
      // Arrange
      const repository = new CommentRepository(dataSource, () => 'id')

      // Action & Assert
      await expect(repository.verifyCommentExists(commentId)).rejects.toThrow(NotFoundError)
    })

    it('should not throw NotFoundError when comment exists', async () => {
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
        id: commentId,
        content: 'komentar',
        commenter: { id: 'user-123' },
        thread: { id: 'thread-123' }
      })
      const repository = new CommentRepository(dataSource, () => 'id')

      // Action & Assert
      await expect(repository.verifyCommentExists(commentId)).resolves.not.toThrow(NotFoundError)
    })

    it('should throw NotFoundError when comment has been soft deleted', async () => {
      // Arrange
      await dataSource.instance.getRepository(Comment).softDelete({ id: commentId })
      const repository = new CommentRepository(dataSource, () => 'id')

      // Action & Assert
      await expect(repository.verifyCommentExists(commentId)).rejects.toThrow(NotFoundError)
    })
  })

  describe('verifyCommentOwner function', () => {
    const userId = 'user-123'
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
        title: 'sebuah thread',
        body: 'badan',
        owner: { id: userId }
      })
    })

    afterAll(async () => {
      await dataSource.instance.getRepository(Thread).delete({ id: threadId })
      await dataSource.instance.getRepository(User).delete({ id: userId })
    })

    it('should throw NotFoundError when comment does not exist', async () => {
      // Arrange
      const repository = new CommentRepository(dataSource, () => '')

      // Action & Assert
      await expect(repository.verifyCommentOwner('comment-xyz', userId)).rejects.toThrowError(NotFoundError)
    })

    it('should throw AuthorizationError when owner is invalid', async () => {
      // Arrange
      await dataSource.instance.getRepository(Comment).save({
        id: commentId,
        content: 'komentar',
        commenter: { id: userId },
        thread: { id: threadId }
      })
      const repository = new CommentRepository(dataSource, () => '')

      // Action & Assert
      await expect(repository.verifyCommentOwner(commentId, 'user-xyz')).rejects.toThrowError(AuthorizationError)
    })

    it('should not throw AuthorizationError when owner is valid', async () => {
      // Arrange
      await dataSource.instance.getRepository(Comment).save({
        id: commentId,
        content: 'komentar',
        commenter: { id: userId },
        thread: { id: threadId }
      })
      const repository = new CommentRepository(dataSource, () => '')

      // Action & Assert
      await expect(repository.verifyCommentOwner(commentId, userId)).resolves.not.toThrowError(AuthorizationError)
    })
  })

  describe('getCommentsByThreadId function', () => {
    const userId = 'user-xyz'
    const threadId = 'thread-xyz'
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
    })

    beforeEach(async () => {
      const comments: CommentWithUsernamePayload[] = [
        {
          id: 'comment-xyz',
          content: 'a comment',
          username,
          date: new Date('2022-03-03')
        },
        {
          id: 'comment-abc',
          content: 'a comment',
          username,
          date: new Date('2022-03-06')
        },
        {
          id: 'comment-def',
          content: 'a comment',
          username,
          date: new Date('2022-03-05')
        }
      ]

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
        },
        {
          id: 'reply-jkl',
          content: 'a reply',
          username,
          date: new Date('2022-03-05')
        },
        {
          id: 'reply-mno',
          content: 'a reply',
          username,
          date: new Date('2022-03-06')
        }
      ]

      for (const comment of comments) {
        await dataSource.instance.getRepository(Comment).save({
          ...comment,
          createdAt: comment.date,
          commenter: { id: userId },
          thread: { id: threadId },
          replies: replies.splice(0, 2).map(r => ({
            ...r,
            createdAt: r.date,
            replier: { id: userId },
            comment: { id: comment.id }
          }))
        })
      }
    })

    afterAll(async () => {
      await dataSource.instance.getRepository(Thread).delete({ id: threadId })
      await dataSource.instance.getRepository(User).delete({ id: userId })
    })

    it('should return comments properly', async () => {
      // Arrange
      const expectedComments: Comments = [
        {
          id: 'comment-xyz',
          content: 'a comment',
          username,
          date: new Date('2022-03-03'),
          replies: [
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
        },
        {
          id: 'comment-def',
          content: 'a comment',
          username,
          date: new Date('2022-03-05'),
          replies: [
            {
              id: 'reply-jkl',
              content: 'a reply',
              username,
              date: new Date('2022-03-05')
            },
            {
              id: 'reply-mno',
              content: 'a reply',
              username,
              date: new Date('2022-03-06')
            }
          ]
        },
        {
          id: 'comment-abc',
          content: 'a comment',
          username,
          date: new Date('2022-03-06'),
          replies: [
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
        }
      ]

      const repository = new CommentRepository(dataSource, () => '')

      // Action
      const comments = await repository.getCommentsByThreadId(threadId)

      // Assert
      expect(comments).toEqual(expectedComments)
    })

    it('should include comment(s) that has been soft deleted', async () => {
      // Arrange
      const sampleComment = await dataSource.instance.getRepository(Comment)
        .findOneByOrFail({ thread: { id: threadId } })
      const commentId = sampleComment.id
      const repository = new CommentRepository(dataSource, () => 'id')
      const initialLength = (await repository.getCommentsByThreadId(threadId)).length

      // Action
      await repository.deleteComment(commentId)
      const comments = await repository.getCommentsByThreadId(threadId)

      // Assert
      expect(comments.length).toEqual(initialLength)
    })

    it('should include reply that has been soft deleted', async () => {
      // Arrange
      const sampleComment = await dataSource.instance.getRepository(Comment)
        .findOneOrFail({
          where: {
            thread: { id: threadId }
          },
          relations: { replies: true }
        })

      const commentId = sampleComment.id
      const initialLength = sampleComment.replies.length
      const replyId = sampleComment.replies[0].id
      await dataSource.instance.getRepository(Reply).softDelete(replyId)

      const repository = new CommentRepository(dataSource, () => 'id')

      // Action
      const comments = await repository.getCommentsByThreadId(threadId)

      // Assert
      for (const comment of comments) {
        if (comment.id === commentId) {
          expect(comment.replies).toHaveLength(initialLength)
          return
        }
      }

      expect('This code should never be called').toEqual('')
    })

    it('should return comments with appropriate amount as requested', async () => {
      // Arrange
      const repository = new CommentRepository(dataSource, () => 'id')

      // Action
      const commentsWithLimit = await repository.getCommentsByThreadId(threadId, { limit: 2 })
      const commentsWithOffset = await repository.getCommentsByThreadId(threadId, { offset: 10 }) // there's only 3 comments saved

      // Assert
      expect(commentsWithLimit).toHaveLength(2)
      expect(commentsWithOffset).toHaveLength(0)
    })

    it('should return comments sorted by date created in ascending order', async () => {
      // Arrange
      const repository = new CommentRepository(dataSource, () => 'id')

      // Action
      const comments = await repository.getCommentsByThreadId(threadId)

      // Assert
      const dates = comments.map(c => c.date)
      expect(isSortedByAscendingDate(dates)).toBe(true)
    })
  })

  describe('getCommentsWithUsernameByThreadId function', () => {
    const userId = 'user-xyz'
    const threadId = 'thread-xyz'
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
    })

    afterAll(async () => {
      await dataSource.instance.getRepository(Thread).delete({ id: threadId })
      await dataSource.instance.getRepository(User).delete({ id: userId })
    })

    it('should return comments with original content when not deleted', async () => {
      // Arrange
      const expectedComments: CommentWithUsernamePayload[] = [
        {
          id: 'comment-xyz',
          content: 'a comment',
          username,
          date: new Date('2022-03-03')
        },
        {
          id: 'comment-abc',
          content: 'a comment',
          username,
          date: new Date('2022-03-04')
        },
        {
          id: 'comment-def',
          content: 'a comment',
          username,
          date: new Date('2022-03-05')
        },
        {
          id: 'comment-ghi',
          content: 'a comment',
          username,
          date: new Date('2022-03-06')
        }
      ]

      for (const comment of expectedComments) {
        await dataSource.instance.getRepository(Comment).save({
          ...comment,
          createdAt: comment.date,
          commenter: { id: userId },
          thread: { id: threadId }
        })
      }

      const repository = new CommentRepository(dataSource, () => '')

      // Action
      const comments = await repository.getCommentsWithUsernameByThreadId(threadId)

      // Assert
      expect(comments).toEqual(expectedComments)
    })

    it('should include comment(s) that has been soft deleted', async () => {
      // Arrange
      const commentsPayload: CommentWithUsernamePayload[] = [
        {
          id: 'comment-xyz',
          content: 'a comment',
          username,
          date: new Date('2022-03-03')
        },
        {
          id: 'comment-abc',
          content: 'a comment',
          username,
          date: new Date('2022-03-04')
        }
      ]
      for (const comment of commentsPayload) {
        await dataSource.instance.getRepository(Comment).save({
          ...comment,
          createdAt: comment.date,
          commenter: { id: userId },
          thread: { id: threadId }
        })
      }
      const repository = new CommentRepository(dataSource, () => 'id')

      // Action
      await repository.deleteComment('comment-abc')
      const comments = await repository.getCommentsWithUsernameByThreadId(threadId)

      // Assert
      expect(comments.length).toEqual(commentsPayload.length)
    })

    it('should return empty list when a thread has no comments', async () => {
      // Arrange
      await dataSource.instance.getRepository(Comment).delete({
        thread: { id: threadId }
      })
      const repository = new CommentRepository(dataSource, () => 'id')

      // Action
      const comments = (await repository.getCommentsWithUsernameByThreadId(threadId))

      // Assert
      expect(comments).toEqual([])
    })

    it('should return comments with appropriate amount as requested', async () => {
      // Arrange
      const comments: CommentWithUsernamePayload[] = [
        {
          id: 'comment-xyz',
          content: 'a comment',
          username,
          date: new Date('2022-03-03')
        },
        {
          id: 'comment-abc',
          content: 'a comment',
          username,
          date: new Date('2022-03-04')
        },
        {
          id: 'comment-def',
          content: 'a comment',
          username,
          date: new Date('2022-03-05')
        },
        {
          id: 'comment-ghi',
          content: 'a comment',
          username,
          date: new Date('2022-03-06')
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

      const repository = new CommentRepository(dataSource, () => 'id')

      // Action
      const commentsWithLimit = await repository.getCommentsWithUsernameByThreadId(threadId, { limit: 3 })
      const commentsWithOffset = await repository.getCommentsWithUsernameByThreadId(threadId, { offset: 10 })

      // Assert
      expect(commentsWithLimit).toHaveLength(3)
      expect(commentsWithOffset).toHaveLength(0)
    })
  })

  describe('deleteComment function', () => {
    const userId = 'user-123'
    const threadId = 'thread-123'

    afterAll(async () => {
      await dataSource.instance.getRepository(Thread).delete({ id: threadId })
      await dataSource.instance.getRepository(User).delete({ id: userId })
    })

    it('should have deletedAt value', async () => {
      // Arrange
      const commentId = 'comment-123'
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

      const repository = new CommentRepository(dataSource, () => '')

      // Action
      await repository.deleteComment(commentId)

      // Assert
      const comment = await dataSource.instance.getRepository(Comment).findOne({
        withDeleted: true,
        where: { id: commentId }
      })
      expect(comment?.deletedAt).toBeDefined()
    })

    it('should throw NotFoundError when comment is not found', async () => {
      // Arrange
      const repository = new CommentRepository(dataSource, () => '')

      // Action & Assert
      await expect(repository.deleteComment('comment-abc')).rejects.toThrowError(NotFoundError)
    })
  })
})

// Test helper function, consider to move it to a separate file
function isSortedByAscendingDate(dateList: Date[]): boolean {
  for (let i = 0; i < dateList.length - 1; i++) {
    const currentDate = new Date(dateList[i])
    const nextDate = new Date(dateList[i + 1])

    if (currentDate > nextDate) return false
  }
  return true
}

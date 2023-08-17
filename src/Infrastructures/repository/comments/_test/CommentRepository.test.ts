import AuthorizationError from '../../../../Commons/exceptions/AuthorizationError'
import NotFoundError from '../../../../Commons/exceptions/NotFoundError'
import AddedComment from '../../../../Domains/comments/entities/AddedComment'
import { type CommentWithUsernamePayload } from '../../../../Domains/comments/entities/CommentWithUsername'
import NewComment from '../../../../Domains/comments/entities/NewComment'
import { type ReplyWithUsernamePayload } from '../../../../Domains/replies/entities/ReplyWithUsername'
import { type CommentWithReplies } from '../../../../Domains/threads/entities/DetailedThread'
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

  describe('getCommentRepliesByCommentIds function', () => {
    const userId = 'user-xyz'
    const threadId = 'thread-xyz'
    const commentIds = ['comment-xyz', 'comment-abc', 'comment-def']
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
          date: new Date('2022-03-06')
        },
        {
          id: 'reply-abc',
          content: 'a reply',
          username,
          date: new Date('2022-03-10')
        },
        {
          id: 'reply-pqx',
          content: 'a reply',
          username,
          date: new Date('2022-03-02')
        },
        {
          id: 'reply-def',
          content: 'a reply',
          username,
          date: new Date('2022-03-07')
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
          replies: replies.splice(0, comment.id === 'comment-xyz' ? 3 : 2).map(r => ({
            ...r,
            createdAt: r.date,
            replier: { id: userId },
            comment: { id: comment.id }
          }))
        })
      }
    })

    // afterAll(async () => {
    //   await dataSource.instance.getRepository(Thread).delete({ id: threadId })
    //   await dataSource.instance.getRepository(User).delete({ id: userId })
    // })

    it('should return comments properly', async () => {
      // Arrange
      const expectedComments = new Map<string, CommentWithReplies>([
        ['comment-xyz', {
          replies: [
            {
              id: 'reply-pqx',
              content: 'a reply',
              username,
              date: new Date('2022-03-02')
            },
            {
              id: 'reply-xyz',
              content: 'a reply',
              username,
              date: new Date('2022-03-06')
            },
            {
              id: 'reply-abc',
              content: 'a reply',
              username,
              date: new Date('2022-03-10')
            }
          ]
        }],
        ['comment-def', {
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
        }],
        ['comment-abc', {
          replies: [
            {
              id: 'reply-ghi',
              content: 'a reply',
              username,
              date: new Date('2022-03-06')
            },
            {
              id: 'reply-def',
              content: 'a reply',
              username,
              date: new Date('2022-03-07')
            }
          ]
        }]
      ])
      const commentIds = [...expectedComments.keys()]
      const repository = new CommentRepository(dataSource, () => '')

      // Action
      const comments = await repository.getCommentRepliesByCommentIds(commentIds)

      // Assert
      for (const commentId of commentIds) {
        expect(comments.get(commentId)).toEqual(expectedComments.get(commentId))
      }
    })

    it('should include comment that has been soft deleted', async () => {
      // Arrange
      const sampleComment = await dataSource.instance.getRepository(Comment)
        .findOneByOrFail({ thread: { id: threadId } })
      const commentId = sampleComment.id
      const repository = new CommentRepository(dataSource, () => 'id')
      const initialLength = [...(await repository.getCommentRepliesByCommentIds(commentIds))].length

      // Action
      await repository.deleteComment(commentId)
      const comments = await repository.getCommentRepliesByCommentIds(commentIds)

      // Assert
      expect([...comments.keys()]).toHaveLength(initialLength)
    })

    it('should include reply that has been soft deleted', async () => {
      // Arrange
      const sampleReply = await dataSource.instance.getRepository(Reply)
        .findOneByOrFail({ comment: { id: commentIds[0] } })
      const replyId = sampleReply.id

      const repository = new CommentRepository(dataSource, () => 'id')

      // Action
      await dataSource.instance.getRepository(Reply).softDelete({ id: replyId })
      const commentReplies = await repository.getCommentRepliesByCommentIds(commentIds)

      // Assert
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const index = commentReplies.get(commentIds[0])!.replies.findIndex(r => r.id === replyId)

      expect(index).not.toEqual(-1)
    })

    it('should return replies with appropriate amount as requested', async () => {
      // Arrange
      const repository = new CommentRepository(dataSource, () => 'id')

      // Action
      const commentsWithLimit = await repository.getCommentRepliesByCommentIds(commentIds, { limit: 2 })
      const commentsWithOffset = await repository.getCommentRepliesByCommentIds(commentIds, { offset: 3 }) // there's only 2 replies saved for each comment

      // Assert
      for (const comment of commentsWithLimit) {
        expect(comment[1].replies).toHaveLength(2)
      }
      for (const comment of commentsWithOffset) {
        expect(comment[1].replies).toHaveLength(0)
      }
    })

    it('should return replies sorted by date created in ascending order', async () => {
      // Arrange
      const repository = new CommentRepository(dataSource, () => 'id')

      // Action
      const comments = await repository.getCommentRepliesByCommentIds(commentIds)

      // Assert
      for (const comment of comments) {
        const dates = comment[1].replies.map(r => r.date)
        expect(isSortedByAscendingDate(dates)).toBe(true)
      }
    })
  })

  describe('isCommentLikedBy function', () => {
    const commentId = 'comment-like123'
    const userId = 'user-like123'
    const threadId = 'thread-like123'

    beforeEach(async () => {
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
        thread: { id: threadId },
        likers: [{ id: userId }]
      })
    })

    it('should return true when comment is liked by a user', async () => {
      // Arrange
      const repository = new CommentRepository(dataSource, () => '')

      // Action
      const liked = await repository.isCommentLikedBy(userId, commentId)

      // assert
      expect(liked).toStrictEqual(true)
    })

    it('should return false when comment is not liked by a user', async () => {
      // Arrange
      const comment = await dataSource.instance.getRepository(Comment).findOneOrFail({
        relations: { likers: true },
        where: { id: commentId }
      })
      comment.likers = comment.likers.filter((liker) => {
        return liker.id !== userId
      })
      await dataSource.instance.manager.save(comment)

      const repository = new CommentRepository(dataSource, () => '')

      // Action
      const liked = await repository.isCommentLikedBy(userId, commentId)

      // assert
      expect(liked).toStrictEqual(false)
    })
  })

  describe('likeComment function', () => {
    it('should add a new liker', async () => {
      // Arrange
      const commentId = 'comment-like123'
      const userId = 'user-like123'
      const threadId = 'thread-like123'
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

      // Action
      const repository = new CommentRepository(dataSource, () => '')
      await repository.likeComment(commentId, userId)

      // Assert
      const likedComment = await dataSource.instance.getRepository(Comment).findOne({
        relations: { likers: true },
        where: {
          id: commentId,
          likers: { id: userId }
        }
      })
      expect(likedComment).toBeTruthy()
    })
  })

  describe('dislikeComment function', () => {
    it('should remove the liker', async () => {
      // Arrange
      const commentId = 'comment-like123'
      const userId = 'user-like123'
      const threadId = 'thread-like123'
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
        thread: { id: threadId },
        likers: [{ id: userId }]
      })

      // Action
      const repository = new CommentRepository(dataSource, () => '')
      await repository.dislikeComment(commentId, userId)

      // Assert
      const likedComment = await dataSource.instance.getRepository(Comment).findOne({
        relations: { likers: true },
        where: {
          id: commentId,
          likers: { id: userId }
        }
      })
      expect(likedComment).toBeFalsy()
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

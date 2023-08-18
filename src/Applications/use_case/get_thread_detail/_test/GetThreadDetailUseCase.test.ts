import GetThreadDetailUseCase from '../GetThreadDetailUseCase'
import ReplyWithUsername from '../../../../Domains/replies/entities/ReplyWithUsername'
import DetailedThread, { MAX_COMMENTS_COUNT, MAX_REPLIES_PER_COMMENT_COUNT, type DetailedThreadPayload, type CommentWithReplies } from '../../../../Domains/threads/entities/DetailedThread'

describe('ThreadUseCase', () => {
  it('should orchestrate get thread detail action properly', async () => {
    // Arrange
    const threadId = 'thread-123'
    const commentId = 'comment-xyz'
    const expectedThreadWithComments = new DetailedThread({
      id: 'thread-123',
      title: 'a thread',
      body: 'a body',
      date: new Date('2023-03-03'),
      username: 'user',
      comments: [{
        id: commentId,
        content: 'a comment',
        username: 'username',
        replies: Array(2).fill({
          id: 'reply-xyz',
          content: 'a reply',
          username: 'username',
          date: new Date('2023-04-04')
        }),
        date: new Date('2022-03-03'),
        likeCount: 0
      }]
    })

    /** creating use case's dependency */
    const mockThreadRepository: any = {}
    const mockCommentRepository: any = {}

    /** mocking needed function */
    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockImplementation(async () => { await Promise.resolve() })

    const thread: DetailedThreadPayload = {
      id: 'thread-123',
      title: 'a thread',
      body: 'a body',
      date: new Date('2023-03-03'),
      username: 'user',
      comments: [{
        id: commentId,
        content: 'a comment',
        username: 'username',
        replies: [],
        date: new Date('2022-03-03'),
        likeCount: 0
      }]
    }
    mockThreadRepository.getThreadCommentsById = jest.fn()
      .mockImplementation(async () => await Promise.resolve(thread))

    const commentIdAndReplies = new Map<string, CommentWithReplies>()
    commentIdAndReplies.set('comment-xyz', {
      replies: Array(2).fill(new ReplyWithUsername({
        id: 'reply-xyz',
        content: 'a reply',
        username: 'username',
        createdAt: new Date('2023-04-04')
      }).asObject)
    })

    mockCommentRepository.getCommentRepliesByCommentIds = jest.fn(async () => await Promise.resolve(commentIdAndReplies))

    /** creating use case instance */
    const useCase = new GetThreadDetailUseCase(mockThreadRepository, mockCommentRepository)

    // Action
    const threadWithComments = await useCase.execute(threadId)

    // Assert
    expect(threadWithComments).toStrictEqual(expectedThreadWithComments.asObject)
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId)
    expect(mockThreadRepository.getThreadCommentsById).toBeCalledWith(threadId, { limit: MAX_COMMENTS_COUNT })
    expect(mockCommentRepository.getCommentRepliesByCommentIds).toBeCalledWith([commentId], { limit: MAX_REPLIES_PER_COMMENT_COUNT })
  })
})

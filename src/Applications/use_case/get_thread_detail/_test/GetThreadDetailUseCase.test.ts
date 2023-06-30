import GetThreadDetailUseCase from '../GetThreadDetailUseCase'
import CommentWithUsername, { type CommentWithUsernamePayload } from '../../../../Domains/comments/entities/CommentWithUsername'
import ReplyWithUsername, { type ReplyWithUsernamePayload } from '../../../../Domains/replies/entities/ReplyWithUsername'
import DetailedThread, { MAX_COMMENTS_COUNT, MAX_REPLIES_PER_COMMENT_COUNT } from '../../../../Domains/threads/entities/DetailedThread'
import { type ThreadWithUsernamePayload } from '../../../../Domains/threads/entities/ThreadWithUsername'

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
      comments: Array(4).fill({
        id: commentId,
        content: 'a comment',
        username: 'username',
        replies: Array(2).fill({
          id: 'reply-xyz',
          content: 'a reply',
          username: 'username',
          date: new Date('2023-04-04')
        }),
        date: new Date('2022-03-03')
      })
    })

    /** creating use case's dependency */
    const mockThreadRepository: any = {}
    const mockCommentRepository: any = {}
    const mockReplyRepository: any = {}

    /** mocking needed function */
    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockImplementation(async () => { await Promise.resolve() })

    const thread: ThreadWithUsernamePayload = {
      id: 'thread-123',
      title: 'a thread',
      body: 'a body',
      date: new Date('2023-03-03'),
      username: 'user'
    }
    mockThreadRepository.getThreadWithUsernameById = jest.fn()
      .mockImplementation(async () => await Promise.resolve(thread))

    const comments: CommentWithUsernamePayload[] = Array(4).fill(new CommentWithUsername({
      id: 'comment-xyz',
      content: 'a comment',
      username: 'username',
      createdAt: new Date('2022-03-03')
    }).asObject)
    mockCommentRepository.getCommentsWithUsernameByThreadId = jest.fn()
      .mockImplementation(async () => await Promise.resolve(comments))

    const replies: ReplyWithUsernamePayload[] = Array(2).fill(new ReplyWithUsername({
      id: 'reply-xyz',
      content: 'a reply',
      username: 'username',
      createdAt: new Date('2023-04-04')
    }).asObject)
    mockReplyRepository.getRepliesWithUsernameByCommentId = jest.fn()
      .mockImplementation(async () => await Promise.resolve(replies))

    /** creating use case instance */
    const useCase = new GetThreadDetailUseCase(mockThreadRepository, mockCommentRepository, mockReplyRepository)

    // Action
    const threadWithComments = await useCase.execute(threadId)

    // Assert
    expect(threadWithComments).toStrictEqual(expectedThreadWithComments.asObject)
    expect(mockThreadRepository.getThreadWithUsernameById).toBeCalledWith(threadId)
    expect(mockCommentRepository.getCommentsWithUsernameByThreadId).toBeCalledWith(threadId, { limit: MAX_COMMENTS_COUNT })
    expect(mockReplyRepository.getRepliesWithUsernameByCommentId).toBeCalledWith(commentId, { limit: MAX_REPLIES_PER_COMMENT_COUNT })
  })
})

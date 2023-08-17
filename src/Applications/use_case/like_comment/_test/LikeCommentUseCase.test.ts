import LikeCommentUseCase from '../LikeCommentUseCase'
import { type CommentInteractionPayload } from '../../../../Domains/comments/entities/CommentInteraction'

describe('LikeCommentUseCase', () => {
  const mockCommentRepository: any = {}
  const mockThreadRepository: any = {}

  beforeAll(() => {
    mockCommentRepository.verifyCommentExists = jest.fn()
      .mockImplementation(async () => { await Promise.resolve() })
    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockImplementation(async () => { await Promise.resolve() })
  })

  it('should like comment action properly', async () => {
    // Arrange
    const threadId = 'thread-123'
    const commentId = 'comment-123'
    const userId = 'user-123'
    const payload: CommentInteractionPayload = {
      commentId,
      threadId,
      userId
    }

    mockCommentRepository.likeComment = jest.fn()
      .mockImplementation(async () => { await Promise.resolve() })
    mockCommentRepository.isCommentLikedBy = jest.fn()
      .mockImplementation(async () => await Promise.resolve(false))

    const useCase = new LikeCommentUseCase(
      mockThreadRepository,
      mockCommentRepository
    )

    // Action
    await useCase.execute(payload)

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId)
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(commentId)
    expect(mockCommentRepository.isCommentLikedBy).toBeCalledWith(userId, commentId)
    expect(mockCommentRepository.likeComment).toBeCalledWith(commentId)
  })

  it('should dislike comment action properly', async () => {
    // Arrange
    const threadId = 'thread-123'
    const commentId = 'comment-123'
    const userId = 'user-123'
    const payload: CommentInteractionPayload = {
      commentId,
      threadId,
      userId
    }

    mockCommentRepository.isCommentLikedBy = jest.fn()
      .mockImplementation(async () => await Promise.resolve(true))
    mockCommentRepository.dislikeComment = jest.fn()
      .mockImplementation(async () => { await Promise.resolve() })

    const useCase = new LikeCommentUseCase(
      mockThreadRepository,
      mockCommentRepository
    )

    // Action
    await useCase.execute(payload)

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId)
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(commentId)
    expect(mockCommentRepository.isCommentLikedBy).toBeCalledWith(userId, commentId)
    expect(mockCommentRepository.dislikeComment).toBeCalledWith(commentId)
  })
})

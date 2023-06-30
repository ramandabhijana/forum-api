import DeleteCommentUseCase from '../DeleteCommentUseCase'
import { type DeleteCommentPayload } from '../../../../Domains/comments/entities/DeleteComment'

describe('DeleteCommentUseCase', () => {
  it('should orchestrate the delete comment action properly', async () => {
    // Arrange
    const threadId = 'thread-123'
    const commentId = 'comment-123'
    const userId = 'user-123'
    const payload: DeleteCommentPayload = {
      commentId,
      threadId,
      userId
    }

    const mockCommentRepository: any = {}
    const mockThreadRepository: any = {}

    mockCommentRepository.deleteComment = jest.fn()
      .mockImplementation(async () => { await Promise.resolve() })
    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockImplementation(async () => { await Promise.resolve() })
    mockCommentRepository.verifyCommentExists = jest.fn()
      .mockImplementation(async () => { await Promise.resolve() })
    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockImplementation(async () => { await Promise.resolve() })

    const useCase = new DeleteCommentUseCase(
      mockThreadRepository,
      mockCommentRepository
    )

    // Action
    await useCase.execute({ ...payload })

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId)
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(commentId, userId)
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(commentId)
    expect(mockCommentRepository.deleteComment).toBeCalledWith(commentId)
  })
})

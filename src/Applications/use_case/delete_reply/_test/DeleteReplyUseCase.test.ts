import DeleteReplyUseCase from '../DeleteReplyUseCase'
import { type DeleteReplyPayload } from '../../../../Domains/replies/entities/DeleteReply'

describe('DeleteReplyUseCase', () => {
  it('should orchestrate the delete reply action properly', async () => {
    // Arrange
    const threadId = 'thread-123'
    const commentId = 'comment-123'
    const userId = 'user-123'
    const replyId = 'reply-123'
    const payload: DeleteReplyPayload = {
      commentId,
      threadId,
      userId,
      replyId
    }

    const mockCommentRepository: any = {}
    const mockThreadRepository: any = {}
    const mockReplyRepository: any = {}

    mockReplyRepository.deleteReply = jest.fn()
      .mockImplementation(async () => { await Promise.resolve() })
    mockCommentRepository.verifyCommentExists = jest.fn()
      .mockImplementation(async () => { await Promise.resolve() })
    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockImplementation(async () => { await Promise.resolve() })
    mockReplyRepository.verifyReplyExists = jest.fn()
      .mockImplementation(async () => { await Promise.resolve() })
    mockReplyRepository.verifyReplyOwner = jest.fn()
      .mockImplementation(async () => { await Promise.resolve() })

    const useCase = new DeleteReplyUseCase(
      mockThreadRepository,
      mockCommentRepository,
      mockReplyRepository
    )

    // Action
    await useCase.execute({ ...payload })

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId)
    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith(replyId, userId)
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(commentId)
    expect(mockReplyRepository.verifyReplyExists).toBeCalledWith(replyId)
    expect(mockReplyRepository.deleteReply).toBeCalledWith(replyId)
  })
})

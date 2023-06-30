import AddReplyUseCase from '../AddReplyUseCase'
import { type NewReplyPayload } from '../../../../Domains/replies/entities/NewReply'
import AddedReply from '../../../../Domains/replies/entities/AddedReply'

describe('AddReplyUseCase', () => {
  it('should orchestrate the add reply action properly', async () => {
    // Arrange
    const threadId = 'thread-123'
    const commentId = 'comment-123'
    const userId = 'user-123'
    const replyId = 'reply-123'
    const content = 'a reply'
    const payload: NewReplyPayload = {
      commentId,
      threadId,
      userId,
      content
    }
    const expectedAddedReply = new AddedReply({
      id: replyId,
      content,
      owner: userId
    })

    const mockCommentRepository: any = {}
    const mockThreadRepository: any = {}
    const mockReplyRepository: any = {}

    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockImplementation(async () => { await Promise.resolve() })
    mockCommentRepository.verifyCommentExists = jest.fn()
      .mockImplementation(async () => { await Promise.resolve() })
    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(async () => await Promise.resolve(new AddedReply({
        id: 'reply-123',
        content: payload.content,
        owner: payload.userId
      }).asObject))

    const useCase = new AddReplyUseCase(
      mockReplyRepository,
      mockThreadRepository,
      mockCommentRepository
    )

    // Action
    const addedReply = await useCase.execute({ ...payload })

    // Assert
    expect(addedReply).toStrictEqual(expectedAddedReply.asObject)
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId)
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(commentId)
    expect(mockReplyRepository.addReply).toBeCalledWith(content, commentId, userId)
  })
})

import AddCommentUseCase from '../AddCommentUseCase'
import { type NewCommentPayload } from '../../../../Domains/comments/entities/NewComment'
import AddedComment from '../../../../Domains/comments/entities/AddedComment'

describe('AddCommentUseCase', () => {
  it('should orchestrate the add comment action properly', async () => {
    // Arrange
    const content = 'a comment'
    const threadId = 'thread-a456'
    const userId = 'user-123'
    const payload: NewCommentPayload = {
      content,
      threadId,
      userId
    }
    const expectedAddedComment = new AddedComment({
      id: 'comment-123',
      content,
      owner: userId
    })

    /** use case's dependency */
    const mockCommentRepository: any = {}
    const mockThreadRepository: any = {}

    /** mocking needed function */
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(async () => await Promise.resolve(new AddedComment({
        id: 'comment-123',
        content: payload.content,
        owner: payload.userId
      }).asObject))
    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockImplementation(async () => { await Promise.resolve() })

    /** use case instance */
    const useCase = new AddCommentUseCase(
      mockCommentRepository,
      mockThreadRepository
    )

    // Action
    const addedComment = await useCase.execute({ ...payload })

    // Assert
    expect(addedComment).toStrictEqual(expectedAddedComment.asObject)
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(threadId)
    expect(mockCommentRepository.addComment).toBeCalledWith(content, threadId, userId)
  })
})

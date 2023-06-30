import AddThreadUseCase from '../AddThreadUseCase'
import AddedThread from '../../../../Domains/threads/entities/AddedThread'
import { type NewThreadPayload } from '../../../../Domains/threads/entities/NewThread'

describe('AddThreadUseCase', () => {
  it('should orchestrate the add thread action properly', async () => {
    // Arrange
    const userId = 'user-123'
    const title = "This is thread's title"
    const body = "This is thread's body"
    const payload: NewThreadPayload = {
      title,
      body,
      userId
    }
    const expectedAddedThread = new AddedThread({
      id: 'thread-123',
      title,
      owner: userId
    })

    /** creating use case's dependency */
    const mockThreadRepository: any = {}

    /** mocking needed function */
    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(async () => await Promise.resolve(new AddedThread({
        id: 'thread-123',
        title,
        owner: userId
      }).asObject))

    /** creating use case instance */
    const useCase = new AddThreadUseCase(mockThreadRepository)

    // Action
    const addedThread = await useCase.execute({ ...payload })

    // Assert
    expect(addedThread).toStrictEqual(expectedAddedThread.asObject)
    expect(mockThreadRepository.addThread).toBeCalledWith(title, body, userId)
  })
})

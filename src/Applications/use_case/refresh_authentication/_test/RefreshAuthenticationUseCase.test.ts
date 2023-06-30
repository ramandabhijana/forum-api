import { type RefreshAuthPayload } from '../../../../Domains/authentications/entities/RefreshAuth'
import RefreshAuthenticationUseCase from '../RefreshAuthenticationUseCase'

describe('RefreshAuthenticationUseCase', () => {
  it('should orchestrate the refresh authentication action correctly', async () => {
    // Arrange
    const useCasePayload: RefreshAuthPayload = {
      refreshToken: 'some_refresh_token'
    }
    const mockAuthenticationRepository: any = {}
    const mockAuthenticationTokenManager: any = {}

    /** mocking needed function */
    mockAuthenticationRepository.verifyToken = jest.fn()
      .mockImplementation(async () => { await Promise.resolve() })
    mockAuthenticationTokenManager.verifyRefreshToken = jest.fn()
      .mockImplementation(() => { })
    mockAuthenticationTokenManager.decodeRefreshToken = jest.fn()
      .mockImplementation(() => ({ id: 'user-123' }))
    mockAuthenticationTokenManager.createAccessToken = jest.fn()
      .mockImplementation(() => 'some_new_access_token')

    /** Creating the use case instace */
    const refreshAuthenticationUseCase = new RefreshAuthenticationUseCase(mockAuthenticationRepository, mockAuthenticationTokenManager)

    // Action
    const accessToken = await refreshAuthenticationUseCase.execute(useCasePayload)

    // Assert
    expect(mockAuthenticationTokenManager.verifyRefreshToken)
      .toBeCalledWith(useCasePayload.refreshToken)
    expect(mockAuthenticationRepository.verifyToken)
      .toBeCalledWith(useCasePayload.refreshToken)
    expect(mockAuthenticationTokenManager.decodeRefreshToken)
      .toBeCalledWith(useCasePayload.refreshToken)
    expect(mockAuthenticationTokenManager.createAccessToken)
      .toBeCalledWith({ id: 'user-123' })
    expect(accessToken).toEqual('some_new_access_token')
  })
})

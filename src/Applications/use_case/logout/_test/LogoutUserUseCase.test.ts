import { type RefreshAuthPayload } from '../../../../Domains/authentications/entities/RefreshAuth'
import LogoutUserUseCase from '../LogoutUserUseCase'

describe('LogoutUserUseCase', () => {
  it('should orchestrate the delete authentication action properly', async () => {
    // Arrange
    const useCasePayload: RefreshAuthPayload = {
      refreshToken: 'refreshToken'
    }
    const mockAuthenticationRepository: any = {}
    mockAuthenticationRepository.verifyToken = jest.fn()
      .mockImplementation(async () => { await Promise.resolve() })
    mockAuthenticationRepository.deleteToken = jest.fn()
      .mockImplementation(async () => { await Promise.resolve() })

    const logoutUserUseCase = new LogoutUserUseCase(mockAuthenticationRepository)

    // Action
    await logoutUserUseCase.execute(useCasePayload)

    // Assert
    expect(mockAuthenticationRepository.verifyToken)
      .toHaveBeenCalledWith(useCasePayload.refreshToken)
    expect(mockAuthenticationRepository.deleteToken)
      .toHaveBeenCalledWith(useCasePayload.refreshToken)
  })
})

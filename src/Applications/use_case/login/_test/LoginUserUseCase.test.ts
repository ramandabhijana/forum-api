import NewAuth from '../../../../Domains/authentications/entities/NewAuth'
import LoginUserUseCase from '../LoginUserUseCase'
import { type User } from '../../../../Domains/users/types/User'
import { type LoginUserPayload } from '../../../../Domains/users/entities/LoginUser'

describe('LoginUserUseCase', () => {
  it('should orchestrate the login user action properly', async () => {
    // Arrange
    const payload: LoginUserPayload = {
      username: 'dicoding',
      password: 'secret'
    }
    const expectedUpdatedAuth = new NewAuth({
      accessToken: 'access_token',
      refreshToken: 'refresh_token'
    })

    /** creating dependency of use case */
    const mockUserRepository: any = {}
    const mockAuthRepository: any = {}
    const mockPasswordHash: any = {}
    const mockAuthTokenManager: any = {}

    /** mocking needed function */
    const user: User = {
      id: 'user-123',
      username: 'dicoding',
      password: 'encrypted_password',
      fullName: 'Dicoding Indonesia'
    }
    mockUserRepository.getUserByUsername = jest.fn()
      .mockImplementation(async () => await Promise.resolve(user))
    mockPasswordHash.compare = jest.fn()
      .mockImplementation(async () => { await Promise.resolve() })

    mockAuthTokenManager.createAccessToken = jest.fn()
      .mockImplementation(() => 'access_token')

    mockAuthTokenManager.createRefreshToken = jest.fn()
      .mockImplementation(() => 'refresh_token')

    mockAuthRepository.addToken = jest.fn()
      .mockImplementation(async () => { await Promise.resolve() })

    /** creating use case instance */
    const loginUserUseCase = new LoginUserUseCase(
      mockUserRepository,
      mockAuthRepository,
      mockAuthTokenManager,
      mockPasswordHash
    )

    // Action
    const updatedAuth = await loginUserUseCase.execute({ ...payload })

    // Assert
    expect(updatedAuth).toStrictEqual(expectedUpdatedAuth)
    expect(mockUserRepository.getUserByUsername).toBeCalledWith(payload.username)
    expect(mockPasswordHash.compare).toBeCalledWith(payload.password, user.password)
    expect(mockAuthTokenManager.createAccessToken).toBeCalledWith({
      id: user.id
    })
    expect(mockAuthTokenManager.createRefreshToken).toBeCalledWith({
      id: user.id
    })
    expect(mockAuthRepository.addToken).toBeCalledWith(expectedUpdatedAuth.refreshToken)
  })
})

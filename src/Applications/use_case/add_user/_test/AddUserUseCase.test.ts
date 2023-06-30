import RegisterUser, { type RegisterUserPayload } from '../../../../Domains/users/entities/RegisterUser'
import RegisteredUser from '../../../../Domains/users/entities/RegisteredUser'
import AddUserUseCase from '../AddUserUseCase'

describe('AddUserUseCase', () => {
  it('should orchestrate the add user action properly', async () => {
    // Arrange
    const useCasePayload: RegisterUserPayload = {
      username: 'dicoding',
      password: 'secret',
      fullname: 'Dicoding Indonesia'
    }
    const expectedRegisteredUser = new RegisteredUser({
      id: 'user-123',
      username: useCasePayload.username,
      fullname: useCasePayload.fullname
    })

    /** creating dependency of use case */
    const mockUserRepository: any = {}
    const mockPasswordHash: any = {}

    /** mocking needed function */
    mockUserRepository.verifyAvailableUsername = jest.fn()
      .mockImplementation(async () => { await Promise.resolve() })

    const encryptedPassword = '$super_secret_pass$'
    mockPasswordHash.hash = jest.fn()
      .mockImplementation(async () => await Promise.resolve(encryptedPassword))

    mockUserRepository.addUser = jest.fn()
      .mockImplementation(async () => await Promise.resolve(new RegisteredUser({
        id: 'user-123',
        username: useCasePayload.username,
        fullname: useCasePayload.fullname
      }).asObject))

    /** creating use case instance */
    const getUserUseCase = new AddUserUseCase(
      mockUserRepository,
      mockPasswordHash
    )

    // Action
    const registeredUser = await getUserUseCase.execute({ ...useCasePayload })

    // Assert
    expect(registeredUser).toStrictEqual(expectedRegisteredUser.asObject)
    expect(mockUserRepository.verifyAvailableUsername).toBeCalledWith(useCasePayload.username)
    expect(mockPasswordHash.hash).toBeCalledWith(useCasePayload.password)
    expect(mockUserRepository.addUser).toBeCalledWith(new RegisterUser({
      username: useCasePayload.username,
      password: encryptedPassword,
      fullname: useCasePayload.fullname
    }))
  })
})

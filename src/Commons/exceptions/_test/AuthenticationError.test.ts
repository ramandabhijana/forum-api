import AuthenticationError from '../AuthenticationError'
import ClientError from '../ClientError'

describe('AuthenticationError', () => {
  it('should create AuthenticationError correctly', () => {
    const errorMessage = 'authentication error'
    const authenticationError = new AuthenticationError(errorMessage)

    expect(authenticationError).toBeInstanceOf(AuthenticationError)
    expect(authenticationError).toBeInstanceOf(ClientError)
    expect(authenticationError).toBeInstanceOf(Error)

    expect(authenticationError.statusCode).toEqual(401)
    expect(authenticationError.message).toEqual(errorMessage)
    expect(authenticationError.name).toEqual('AuthenticationError')
  })
})

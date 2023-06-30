import AuthorizationError from '../AuthorizationError'
import ClientError from '../ClientError'

describe('AuthorizationError', () => {
  it('should create AuthorizationError correctly', () => {
    const errorMessage = 'authentication error'
    const authorizationError = new AuthorizationError(errorMessage)

    expect(authorizationError).toBeInstanceOf(AuthorizationError)
    expect(authorizationError).toBeInstanceOf(ClientError)
    expect(authorizationError).toBeInstanceOf(Error)

    expect(authorizationError.statusCode).toEqual(403)
    expect(authorizationError.message).toEqual(errorMessage)
    expect(authorizationError.name).toEqual('AuthorizationError')
  })
})

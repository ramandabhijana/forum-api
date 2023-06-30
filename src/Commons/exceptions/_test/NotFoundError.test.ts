import ClientError from '../ClientError'
import NotFoundError from '../NotFoundError'

describe('NotFoundError', () => {
  it('should create error correctly', () => {
    const message = 'not found!'
    const notFoundError = new NotFoundError(message)

    expect(notFoundError).toBeInstanceOf(NotFoundError)
    expect(notFoundError).toBeInstanceOf(ClientError)
    expect(notFoundError).toBeInstanceOf(Error)

    expect(notFoundError.message).toEqual(message)
    expect(notFoundError.statusCode).toEqual(404)
    expect(notFoundError.name).toEqual('NotFoundError')
  })
})

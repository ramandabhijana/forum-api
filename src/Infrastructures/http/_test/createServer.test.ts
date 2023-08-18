import { createServer } from '../createServer'
import { AppDataSource } from '../../database/data-source'
import { INTERNAL_SERVER_ERROR } from '../../../Commons/exceptions/messages/ErrorMessages'
import container from '../../container'

describe('HTTP server', () => {
  let dataSource: AppDataSource

  beforeAll(done => {
    dataSource = new AppDataSource()
    dataSource.instance.initialize()
      .then(() => { done() })
      .catch(err => { console.log(err) })
  })

  afterAll(async () => {
    await dataSource.instance.dropDatabase()
    await dataSource.instance.destroy()
  })

  it('should respond with 200 when GET request on root route', async () => {
    // Arrange
    const server = await createServer(container)

    // Action
    const response = await server.inject({
      method: 'GET',
      url: '/'
    })

    // Assert
    expect(response.statusCode).toEqual(200)
  })

  it('should respond with 404 when requesting unregistered route', async () => {
    // Arrange
    const server = await createServer(container)

    // Action
    const response = await server.inject({
      method: 'GET',
      url: '/unregistered-route'
    })

    // Assert
    expect(response.statusCode).toEqual(404)
  })

  it('should handle server error correctly', async () => {
    // Arrange
    const requestPayload = {
      username: 'dicoding',
      fullname: 'Dicoding Indonesia',
      password: 'super_secret'
    }
    const server = await createServer(container)

    container.destroyInstance(AppDataSource.name)

    // Action
    const response = await server.inject({
      method: 'POST',
      url: '/users',
      payload: requestPayload
    })

    // Assert
    const responseJson = JSON.parse(response.payload)
    expect(response.statusCode).toEqual(500)
    expect(responseJson.status).toEqual('error')
    expect(responseJson.message).toEqual(INTERNAL_SERVER_ERROR)
  })
})

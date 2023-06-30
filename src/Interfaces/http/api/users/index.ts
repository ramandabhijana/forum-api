import { type Plugin, type Server } from '@hapi/hapi'
import { type Container } from 'instances-container'
import UsersHandler from './handler'
import routes from './routes'

export const users: Plugin<{ container: Container }, void> = {
  name: 'users',
  register: async (server: Server, { container }) => {
    const handler = new UsersHandler(container)
    server.route(routes(handler))
  }
}

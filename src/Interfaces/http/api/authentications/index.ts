import { type Plugin, type Server } from '@hapi/hapi'
import { type Container } from 'instances-container'
import AuthenticationsHandler from './handler'
import routes from './routes'

export const authentications: Plugin<{ container: Container }, void> = {
  name: 'authentications',
  register: async (server: Server, { container }) => {
    const handler = new AuthenticationsHandler(container)
    server.route(routes(handler))
  }
}

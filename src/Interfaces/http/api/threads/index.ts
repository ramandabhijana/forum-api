import { type Plugin, type Server } from '@hapi/hapi'
import { type Container } from 'instances-container'
import ThreadsHandler from './handler'
import routes from './routes'

export const threads: Plugin<{ container: Container }, void> = {
  name: 'threads',
  register: async (server: Server, { container }) => {
    const handler = new ThreadsHandler(container)
    server.route(routes(handler))
  }
}

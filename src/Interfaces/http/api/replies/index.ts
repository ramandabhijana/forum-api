import { type Plugin, type Server } from '@hapi/hapi'
import { type Container } from 'instances-container'
import routes from './routes'
import RepliesHandler from './handler'

export const replies: Plugin<{ container: Container }, void> = {
  name: 'replies',
  register: async (server: Server, { container }) => {
    const handler = new RepliesHandler(container)
    server.route(routes(handler))
  }
}

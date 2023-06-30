import { type Plugin, type Server } from '@hapi/hapi'
import { type Container } from 'instances-container'
import routes from './routes'
import CommentsHandler from './handler'

export const comments: Plugin<{ container: Container }, void> = {
  name: 'comments',
  register: async (server: Server, { container }) => {
    const handler = new CommentsHandler(container)
    server.route(routes(handler))
  }
}

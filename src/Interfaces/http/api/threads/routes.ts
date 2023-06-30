import type Hapi from '@hapi/hapi'
import type ThreadsHandler from './handler'

const routes: (handler: ThreadsHandler) => Hapi.ServerRoute[] = (handler) => ([
  {
    method: 'POST',
    path: '/threads',
    handler: handler.postThreadHandler,
    options: { auth: 'forum_api_jwt' }
  },
  {
    method: 'GET',
    path: '/threads/{threadId}',
    handler: handler.getThreadByIdHandler
  }
])

export default routes

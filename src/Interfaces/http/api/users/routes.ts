import type Hapi from '@hapi/hapi'
import type UsersHandler from './handler'

const routes: (handler: UsersHandler) => Hapi.ServerRoute[] = (handler) => ([
  {
    method: 'POST',
    path: '/users',
    handler: handler.postUserHandler
  }
])

export default routes

import type Hapi from '@hapi/hapi'
import type AuthenticationsHandler from './handler'

const routes: (handler: AuthenticationsHandler) => Hapi.ServerRoute[] = (handler) => ([
  {
    method: 'POST',
    path: '/authentications',
    handler: handler.postAuthenticationHandler
  },
  {
    method: 'PUT',
    path: '/authentications',
    handler: handler.putAuthenticationHandler
  },
  {
    method: 'DELETE',
    path: '/authentications',
    handler: handler.deleteAuthenticationHandler
  }
])

export default routes

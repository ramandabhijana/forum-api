import type Hapi from '@hapi/hapi'
import type RepliesHandler from './handler'

const routes: (handler: RepliesHandler) => Hapi.ServerRoute[] = (handler) => ([
  {
    method: 'POST',
    path: '/threads/{threadId}/comments/{commentId}/replies',
    handler: handler.postReplyHandler,
    options: { auth: 'forum_api_jwt' }
  },
  {
    method: 'DELETE',
    path: '/threads/{threadId}/comments/{commentId}/replies/{replyId}',
    handler: handler.deleteReplyHandler,
    options: { auth: 'forum_api_jwt' }
  }
])

export default routes

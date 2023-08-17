import type Hapi from '@hapi/hapi'
import type CommentsHandler from './handler'

const routes: (handler: CommentsHandler) => Hapi.ServerRoute[] = (handler) => ([
  {
    method: 'POST',
    path: '/threads/{threadId}/comments',
    handler: handler.postCommentHandler,
    options: { auth: 'forum_api_jwt' }
  },
  {
    method: 'DELETE',
    path: '/threads/{threadId}/comments/{commentId}',
    handler: handler.deleteCommentHandler,
    options: { auth: 'forum_api_jwt' }
  },
  {
    method: 'PUT',
    path: '/threads/{threadId}/comments/{commentId}/likes',
    handler: handler.likesCommentHandler,
    options: { auth: 'forum_api_jwt' }
  }
])

export default routes

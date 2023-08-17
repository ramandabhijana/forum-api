import { type Request, type ResponseObject, type ResponseToolkit } from '@hapi/hapi'
import autoBind from 'auto-bind'
import { type Container } from 'instances-container'
import { type TokenPayload } from '../../../../Applications/security/AuthenticationTokenManager'
import AddCommentUseCase from '../../../../Applications/use_case/add_comment/AddCommentUseCase'
import { type NewCommentPayload } from '../../../../Domains/comments/entities/NewComment'
import { CREATED } from '../../constants/HttpStatusCode'
import { SUCCESS_STATUS_RESPONSE } from '../../constants/HttpResponse'
import DeleteCommentUseCase from '../../../../Applications/use_case/delete_comment/DeleteCommentUseCase'
import LikeCommentUseCase from '../../../../Applications/use_case/like_comment/LikeCommentUseCase'

type PostCommentBodyRequest = Pick<NewCommentPayload, 'content'>

class CommentsHandler {
  constructor(private readonly container: Container) {
    autoBind(this)
  }

  async postCommentHandler(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    const { id: userId } = request.auth.credentials as unknown as TokenPayload
    const threadId = request.params.threadId
    const requestPayload = request.payload as PostCommentBodyRequest

    const useCase: AddCommentUseCase = this.container.getInstance(AddCommentUseCase.name)
    const addedComment = await useCase.execute({
      ...requestPayload,
      threadId,
      userId
    })

    return h
      .response({
        status: SUCCESS_STATUS_RESPONSE,
        data: { addedComment }
      })
      .code(CREATED)
  }

  async deleteCommentHandler(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    const { id: userId } = request.auth.credentials as unknown as TokenPayload
    const threadId = request.params.threadId
    const commentId = request.params.commentId

    const useCase: DeleteCommentUseCase = this.container.getInstance(DeleteCommentUseCase.name)
    await useCase.execute({ threadId, commentId, userId })

    return h.response({ status: SUCCESS_STATUS_RESPONSE })
  }

  async likesCommentHandler(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    const { id: userId } = request.auth.credentials as unknown as TokenPayload
    const threadId = request.params.threadId
    const commentId = request.params.commentId

    const useCase: LikeCommentUseCase = this.container.getInstance(LikeCommentUseCase.name)
    await useCase.execute({ threadId, commentId, userId })

    return h.response({ status: SUCCESS_STATUS_RESPONSE })
  }
}

export default CommentsHandler

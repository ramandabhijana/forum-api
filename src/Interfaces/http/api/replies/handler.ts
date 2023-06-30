import { type Request, type ResponseObject, type ResponseToolkit } from '@hapi/hapi'
import autoBind from 'auto-bind'
import { type Container } from 'instances-container'
import { type TokenPayload } from '../../../../Applications/security/AuthenticationTokenManager'
import AddReplyUseCase from '../../../../Applications/use_case/add_reply/AddReplyUseCase'
import { type NewReplyPayload } from '../../../../Domains/replies/entities/NewReply'
import { CREATED } from '../../constants/HttpStatusCode'
import { SUCCESS_STATUS_RESPONSE } from '../../constants/HttpResponse'
import DeleteReplyUseCase from '../../../../Applications/use_case/delete_reply/DeleteReplyUseCase'

type PostReplyBodyRequest = Pick<NewReplyPayload, 'content'>

class RepliesHandler {
  constructor(private readonly container: Container) {
    autoBind(this)
  }

  async postReplyHandler(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    const { id: userId } = request.auth.credentials as unknown as TokenPayload
    const threadId = request.params.threadId
    const commentId = request.params.commentId
    const requestPayload = request.payload as PostReplyBodyRequest

    const useCase: AddReplyUseCase = this.container.getInstance(AddReplyUseCase.name)
    const addedReply = await useCase.execute({
      ...requestPayload,
      commentId,
      threadId,
      userId
    })

    return h
      .response({
        status: SUCCESS_STATUS_RESPONSE,
        data: { addedReply }
      })
      .code(CREATED)
  }

  async deleteReplyHandler(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    const { id: userId } = request.auth.credentials as unknown as TokenPayload
    const threadId = request.params.threadId
    const commentId = request.params.commentId
    const replyId = request.params.replyId

    const useCase: DeleteReplyUseCase = this.container.getInstance(DeleteReplyUseCase.name)
    await useCase.execute({ threadId, commentId, replyId, userId })

    return h.response({ status: SUCCESS_STATUS_RESPONSE })
  }
}

export default RepliesHandler

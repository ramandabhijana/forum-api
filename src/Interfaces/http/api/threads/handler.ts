import { type Request, type ResponseObject, type ResponseToolkit } from '@hapi/hapi'
import autoBind from 'auto-bind'
import { type Container } from 'instances-container'
import AddThreadUseCase from '../../../../Applications/use_case/add_thread/AddThreadUseCase'
import { type TokenPayload } from '../../../../Applications/security/AuthenticationTokenManager'
import { type NewThreadPayload } from '../../../../Domains/threads/entities/NewThread'
import { SUCCESS_STATUS_RESPONSE } from '../../constants/HttpResponse'
import { CREATED } from '../../constants/HttpStatusCode'
import GetThreadDetailUseCase from '../../../../Applications/use_case/get_thread_detail/GetThreadDetailUseCase'

type PostThreadBodyRequest = Omit<NewThreadPayload, 'userId'>

class ThreadsHandler {
  constructor(private readonly container: Container) {
    autoBind(this)
  }

  async postThreadHandler(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    const { id: userId } = request.auth.credentials as unknown as TokenPayload
    const requestPayload = request.payload as PostThreadBodyRequest

    const useCase: AddThreadUseCase = this.container.getInstance(AddThreadUseCase.name)
    const addedThread = await useCase.execute({
      ...requestPayload,
      userId
    })

    return h
      .response({
        status: SUCCESS_STATUS_RESPONSE,
        data: { addedThread }
      })
      .code(CREATED)
  }

  async getThreadByIdHandler(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    const threadId = request.params.threadId

    const useCase: GetThreadDetailUseCase = this.container.getInstance(GetThreadDetailUseCase.name)
    const thread = await useCase.execute(threadId)

    return h.response({
      status: SUCCESS_STATUS_RESPONSE,
      data: { thread }
    })
  }
}

export default ThreadsHandler

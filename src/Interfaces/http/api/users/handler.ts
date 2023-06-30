import { type Request, type ResponseToolkit, type ResponseObject } from '@hapi/hapi'
import { type Container } from 'instances-container'
import AddUserUseCase from '../../../../Applications/use_case/add_user/AddUserUseCase'
import autoBind from 'auto-bind'
import { type RegisterUserPayload } from '../../../../Domains/users/entities/RegisterUser'
import { SUCCESS_STATUS_RESPONSE } from '../../constants/HttpResponse'
import { CREATED } from '../../constants/HttpStatusCode'

class UsersHandler {
  constructor(private readonly container: Container) {
    autoBind(this)
  }

  async postUserHandler(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    const payload = request.payload as RegisterUserPayload

    const addUserUseCase: AddUserUseCase = this.container.getInstance(AddUserUseCase.name)
    const addedUser = await addUserUseCase.execute(payload)

    return h
      .response({
        status: SUCCESS_STATUS_RESPONSE,
        data: { addedUser }
      })
      .code(CREATED)
  }
}

export default UsersHandler

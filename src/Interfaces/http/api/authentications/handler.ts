import { type Request, type ResponseToolkit, type ResponseObject } from '@hapi/hapi'
import { type Container } from 'instances-container'
import autoBind from 'auto-bind'
import LoginUserUseCase from '../../../../Applications/use_case/login/LoginUserUseCase'
import { type LoginUserPayload } from '../../../../Domains/users/entities/LoginUser'
import { CREATED } from '../../constants/HttpStatusCode'
import { SUCCESS_STATUS_RESPONSE } from '../../constants/HttpResponse'
import RefreshAuthenticationUseCase from '../../../../Applications/use_case/refresh_authentication/RefreshAuthenticationUseCase'
import { type RefreshAuthPayload } from '../../../../Domains/authentications/entities/RefreshAuth'
import LogoutUserUseCase from '../../../../Applications/use_case/logout/LogoutUserUseCase'

class AuthenticationsHandler {
  constructor(private readonly container: Container) {
    autoBind(this)
  }

  async postAuthenticationHandler(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    const payload = request.payload as LoginUserPayload

    const loginUseCase: LoginUserUseCase = this.container.getInstance(LoginUserUseCase.name)
    const { accessToken, refreshToken } = await loginUseCase.execute(payload)

    return h
      .response({
        status: SUCCESS_STATUS_RESPONSE,
        data: {
          accessToken,
          refreshToken
        }
      })
      .code(CREATED)
  }

  async putAuthenticationHandler(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    const payload = request.payload as RefreshAuthPayload

    const useCase: RefreshAuthenticationUseCase = this.container.getInstance(RefreshAuthenticationUseCase.name)
    const accessToken = await useCase.execute(payload)

    return h
      .response({
        status: SUCCESS_STATUS_RESPONSE,
        data: { accessToken }
      })
  }

  async deleteAuthenticationHandler(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    const payload = request.payload as RefreshAuthPayload

    const useCase: LogoutUserUseCase = this.container.getInstance(LogoutUserUseCase.name)
    await useCase.execute(payload)

    return h.response({ status: SUCCESS_STATUS_RESPONSE })
  }
}

export default AuthenticationsHandler

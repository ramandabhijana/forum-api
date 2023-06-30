import Joi from 'joi'
import DomainEntity from '../../DomainEntity'

export interface LoginUserPayload {
  username: string
  password: string
}

class LoginUser extends DomainEntity<LoginUserPayload> {
  get username(): string { return this.payload.username }
  get password(): string { return this.payload.password }

  protected get entityName(): string {
    return LoginUser.name
  }

  protected get schema(): Joi.PartialSchemaMap<LoginUserPayload> {
    return {
      username: Joi.string().max(50).required(),
      password: Joi.string().min(3).required()
    }
  }

  protected shouldTranslateErrorToClientError(): boolean { return true }
}

export default LoginUser

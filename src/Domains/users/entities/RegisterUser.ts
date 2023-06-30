import Joi from 'joi'
import DomainEntity from '../../DomainEntity'
import { USERNAME_CONTAIN_RESTRICTED_CHARACTER } from '../../../Commons/exceptions/consts/DomainErrorConsts'

export interface RegisterUserPayload {
  username: string
  password: string
  fullname: string
}

class RegisterUser extends DomainEntity<RegisterUserPayload> {
  get username(): string { return this.payload.username }

  get password(): string { return this.payload.password }
  set password(v: string) { this.payload.password = v }

  get fullname(): string { return this.payload.fullname }

  protected get entityName(): string {
    return RegisterUser.name
  }

  protected get schema(): Joi.PartialSchemaMap<RegisterUserPayload> {
    return {
      username: Joi.string().regex(/^[\w]+$/).max(50).required().messages({
        'string.pattern.base': `${this.entityName}.${USERNAME_CONTAIN_RESTRICTED_CHARACTER}`
      }),
      password: Joi.string().min(3).required(),
      fullname: Joi.string().max(255).required()
    }
  }

  protected shouldTranslateErrorToClientError(): boolean { return true }
}

export default RegisterUser

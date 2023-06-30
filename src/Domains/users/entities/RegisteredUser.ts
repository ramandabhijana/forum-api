import Joi from 'joi'
import DomainEntity from '../../DomainEntity'

export interface RegisteredUserPayload {
  id: string
  username: string
  fullname: string
}

class RegisteredUser extends DomainEntity<RegisteredUserPayload> {
  get id(): string { return this.payload.id }
  get username(): string { return this.payload.username }
  get fullname(): string { return this.payload.fullname }

  protected get entityName(): string {
    return RegisteredUser.name
  }

  protected get schema(): Joi.PartialSchemaMap<RegisteredUserPayload> {
    return {
      id: Joi.string().required(),
      username: Joi.string().required(),
      fullname: Joi.string().required()
    }
  }

  protected shouldTranslateErrorToClientError(): boolean { return false }
}

export default RegisteredUser

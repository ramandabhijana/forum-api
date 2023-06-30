import Joi from 'joi'
import DomainEntity from '../../DomainEntity'

export interface NewAuthPayload {
  accessToken: string
  refreshToken: string
}

class NewAuth extends DomainEntity<NewAuthPayload> {
  get accessToken(): string { return this.payload.accessToken }
  get refreshToken(): string { return this.payload.refreshToken }

  protected get entityName(): string {
    return NewAuth.name
  }

  protected get schema(): Joi.PartialSchemaMap<NewAuthPayload> {
    return {
      accessToken: Joi.string().required(),
      refreshToken: Joi.string().required()
    }
  }

  protected shouldTranslateErrorToClientError(): boolean { return false }
}

export default NewAuth

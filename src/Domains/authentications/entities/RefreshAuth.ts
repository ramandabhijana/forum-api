import Joi from 'joi'
import DomainEntity from '../../DomainEntity'

export interface RefreshAuthPayload {
  refreshToken: string
}

class RefreshAuth extends DomainEntity<RefreshAuthPayload> {
  protected get entityName(): string {
    return RefreshAuth.name
  }

  protected get schema(): Joi.PartialSchemaMap<RefreshAuthPayload> {
    return {
      refreshToken: Joi.string().required()
    }
  }

  protected shouldTranslateErrorToClientError(): boolean { return true }
}

export default RefreshAuth

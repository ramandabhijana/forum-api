import Joi from 'joi'
import DomainEntity from '../../DomainEntity'

export interface NewThreadPayload {
  title: string
  body: string
  userId: string
}

class NewThread extends DomainEntity<NewThreadPayload> {
  get title(): string { return this.payload.title }
  get body(): string { return this.payload.body }
  get userId(): string { return this.payload.userId }

  protected get entityName(): string {
    return NewThread.name
  }

  protected get schema(): Joi.PartialSchemaMap<NewThreadPayload> {
    return {
      title: Joi.string().max(100).required(),
      body: Joi.string().max(255).required(),
      userId: Joi.string().required()
    }
  }

  protected shouldTranslateErrorToClientError(): boolean { return true }
}

export default NewThread

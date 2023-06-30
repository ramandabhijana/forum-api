import Joi from 'joi'
import DomainEntity from '../../DomainEntity'

export interface AddedThreadPayload {
  id: string
  title: string
  owner: string
}

class AddedThread extends DomainEntity<AddedThreadPayload> {
  get id(): string { return this.payload.id }
  get title(): string { return this.payload.title }
  get owner(): string { return this.payload.owner }

  protected get entityName(): string {
    return AddedThread.name
  }

  protected get schema(): Joi.PartialSchemaMap<AddedThreadPayload> {
    return {
      id: Joi.string().required(),
      title: Joi.string().required(),
      owner: Joi.string().required()
    }
  }

  protected shouldTranslateErrorToClientError(): boolean { return false }
}

export default AddedThread

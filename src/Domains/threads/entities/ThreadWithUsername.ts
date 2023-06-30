import Joi from 'joi'
import DomainEntity from '../../DomainEntity'

export interface ThreadWithUsernamePayload {
  id: string
  title: string
  body: string
  date: Date
  username: string
}

class ThreadWithUsername extends DomainEntity<ThreadWithUsernamePayload> {
  get id(): string { return this.payload.id }
  get title(): string { return this.payload.title }
  get body(): string { return this.payload.body }
  get date(): Date { return this.payload.date }
  get username(): string { return this.payload.username }

  protected get entityName(): string {
    return ThreadWithUsername.name
  }

  protected get schema(): Joi.PartialSchemaMap<ThreadWithUsernamePayload> {
    return {
      id: Joi.string().required(),
      title: Joi.string().required(),
      body: Joi.string().required(),
      date: Joi.date().iso().required(),
      username: Joi.string().required()
    }
  }

  protected shouldTranslateErrorToClientError(): boolean { return false }
}

export default ThreadWithUsername

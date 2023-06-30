import Joi from 'joi'
import DomainEntity from '../../DomainEntity'

export interface ConstructorPayload {
  id: string
  content: string
  createdAt: Date
  deletedAt?: Date
  username: string
}

export interface ReplyWithUsernamePayload {
  id: string
  content: string
  date: Date
  username: string
}

class ReplyWithUsername extends DomainEntity<ReplyWithUsernamePayload> {
  get id(): string { return this.payload.id }
  get content(): string { return this.payload.content }
  get date(): Date { return this.payload.date }
  get username(): string { return this.payload.username }

  static DELETED_REPLY_CONTENT: string = '**balasan telah dihapus**'

  protected get entityName(): string {
    return ReplyWithUsername.name
  }

  constructor(payload: ConstructorPayload) {
    const content = payload?.deletedAt != null && payload.deletedAt instanceof Date
      ? ReplyWithUsername.DELETED_REPLY_CONTENT
      : payload?.content

    super({
      id: payload?.id,
      content,
      date: payload?.createdAt,
      username: payload?.username
    })
  }

  protected get schema(): Joi.PartialSchemaMap<ReplyWithUsernamePayload> {
    return {
      id: Joi.string().required(),
      content: Joi.string().required(),
      date: Joi.date().iso().required(),
      username: Joi.string().required()
    }
  }

  protected shouldTranslateErrorToClientError(): boolean { return false }
}

export default ReplyWithUsername

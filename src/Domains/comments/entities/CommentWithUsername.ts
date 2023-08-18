import Joi from 'joi'
import DomainEntity from '../../DomainEntity'

export interface ConstructorPayload {
  id: string
  content: string
  createdAt: Date
  deletedAt?: Date
  username: string
  likeCount: number
}

export interface CommentWithUsernamePayload {
  id: string
  content: string
  date: Date
  username: string
  likeCount: number
}

class CommentWithUsername extends DomainEntity<CommentWithUsernamePayload> {
  get id(): string { return this.payload.id }
  get content(): string { return this.payload.content }
  get date(): Date { return this.payload.date }
  get username(): string { return this.payload.username }

  static DELETED_COMMENT_CONTENT: string = '**komentar telah dihapus**'

  protected get entityName(): string {
    return CommentWithUsername.name
  }

  constructor(payload: ConstructorPayload) {
    const content = payload?.deletedAt != null && payload.deletedAt instanceof Date
      ? CommentWithUsername.DELETED_COMMENT_CONTENT
      : payload?.content

    super({
      id: payload?.id,
      content,
      date: payload?.createdAt,
      username: payload?.username,
      likeCount: payload?.likeCount
    })
  }

  protected get schema(): Joi.PartialSchemaMap<CommentWithUsernamePayload> {
    return {
      id: Joi.string().required(),
      content: Joi.string().required(),
      date: Joi.date().iso().required(),
      username: Joi.string().required(),
      likeCount: Joi.number().integer().required()
    }
  }

  protected shouldTranslateErrorToClientError(): boolean { return false }
}

export default CommentWithUsername

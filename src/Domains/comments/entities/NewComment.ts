import Joi from 'joi'
import DomainEntity from '../../DomainEntity'

export interface NewCommentPayload {
  content: string
  threadId: string
  userId: string
}

class NewComment extends DomainEntity<NewCommentPayload> {
  get content(): string { return this.payload.content }
  get threadId(): string { return this.payload.threadId }
  get userId(): string { return this.payload.userId }

  protected get entityName(): string {
    return NewComment.name
  }

  protected get schema(): Joi.PartialSchemaMap<NewCommentPayload> {
    return {
      content: Joi.string().max(150).required(),
      threadId: Joi.string().required(),
      userId: Joi.string().required()
    }
  }

  protected shouldTranslateErrorToClientError(): boolean { return true }
}

export default NewComment

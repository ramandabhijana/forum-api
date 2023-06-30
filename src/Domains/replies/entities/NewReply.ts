import Joi from 'joi'
import DomainEntity from '../../DomainEntity'

export interface NewReplyPayload {
  threadId: string
  commentId: string
  content: string
  userId: string
}

class NewReply extends DomainEntity<NewReplyPayload> {
  get threadId(): string { return this.payload.threadId }
  get commentId(): string { return this.payload.commentId }
  get content(): string { return this.payload.content }
  get userId(): string { return this.payload.userId }

  protected get entityName(): string {
    return NewReply.name
  }

  protected get schema(): Joi.PartialSchemaMap<NewReplyPayload> {
    return {
      content: Joi.string().max(100).required(),
      commentId: Joi.string().required(),
      threadId: Joi.string().required(),
      userId: Joi.string().required()
    }
  }

  protected shouldTranslateErrorToClientError(): boolean { return true }
}

export default NewReply

import Joi from 'joi'
import DomainEntity from '../../DomainEntity'

export interface DeleteReplyPayload {
  threadId: string
  commentId: string
  replyId: string
  userId: string
}

class DeleteReply extends DomainEntity<DeleteReplyPayload> {
  get threadId(): string { return this.payload.threadId }
  get commentId(): string { return this.payload.commentId }
  get replyId(): string { return this.payload.replyId }
  get userId(): string { return this.payload.userId }

  protected get entityName(): string {
    return DeleteReply.name
  }

  protected get schema(): Joi.PartialSchemaMap<DeleteReplyPayload> {
    return {
      threadId: Joi.string().required(),
      commentId: Joi.string().required(),
      replyId: Joi.string().required(),
      userId: Joi.string().required()
    }
  }

  protected shouldTranslateErrorToClientError(): boolean { return true }
}

export default DeleteReply

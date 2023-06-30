import Joi from 'joi'
import DomainEntity from '../../DomainEntity'

export interface DeleteCommentPayload {
  threadId: string
  commentId: string
  userId: string
}

class DeleteComment extends DomainEntity<DeleteCommentPayload> {
  get threadId(): string { return this.payload.threadId }
  get commentId(): string { return this.payload.commentId }
  get userId(): string { return this.payload.userId }

  protected get entityName(): string {
    return DeleteComment.name
  }

  protected get schema(): Joi.PartialSchemaMap<DeleteCommentPayload> {
    return {
      threadId: Joi.string().required(),
      commentId: Joi.string().required(),
      userId: Joi.string().required()
    }
  }

  protected shouldTranslateErrorToClientError(): boolean { return true }
}

export default DeleteComment

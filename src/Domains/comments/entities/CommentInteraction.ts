import Joi from 'joi'
import DomainEntity from '../../DomainEntity'

export interface CommentInteractionPayload {
  threadId: string
  commentId: string
  userId: string
}

class CommentInteraction extends DomainEntity<CommentInteractionPayload> {
  get threadId(): string { return this.payload.threadId }
  get commentId(): string { return this.payload.commentId }
  get userId(): string { return this.payload.userId }

  protected get entityName(): string {
    return CommentInteraction.name
  }

  protected get schema(): Joi.PartialSchemaMap<CommentInteractionPayload> {
    return {
      threadId: Joi.string().required(),
      commentId: Joi.string().required(),
      userId: Joi.string().required()
    }
  }

  protected shouldTranslateErrorToClientError(): boolean { return true }
}

export default CommentInteraction

import Joi from 'joi'
import DomainEntity from '../../DomainEntity'

export interface AddedCommentPayload {
  id: string
  content: string
  owner: string
}

class AddedComment extends DomainEntity<AddedCommentPayload> {
  protected get entityName(): string {
    return AddedComment.name
  }

  protected get schema(): Joi.PartialSchemaMap<AddedCommentPayload> {
    return {
      id: Joi.string().required(),
      content: Joi.string().required(),
      owner: Joi.string().required()
    }
  }

  protected shouldTranslateErrorToClientError(): boolean { return false }
}

export default AddedComment

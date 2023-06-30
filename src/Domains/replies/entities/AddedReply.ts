import Joi from 'joi'
import DomainEntity from '../../DomainEntity'

export interface AddedReplyPayload {
  id: string
  content: string
  owner: string
}

class AddedReply extends DomainEntity<AddedReplyPayload> {
  protected get entityName(): string {
    return AddedReply.name
  }

  protected get schema(): Joi.PartialSchemaMap<AddedReplyPayload> {
    return {
      id: Joi.string().required(),
      content: Joi.string().required(),
      owner: Joi.string().required()
    }
  }

  protected shouldTranslateErrorToClientError(): boolean { return false }
}

export default AddedReply

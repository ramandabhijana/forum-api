import Joi from 'joi'
import DomainEntity from '../../DomainEntity'
import { type CommentWithUsernamePayload } from '../../comments/entities/CommentWithUsername'
import { type ReplyWithUsernamePayload } from '../../replies/entities/ReplyWithUsername'

export const MAX_COMMENTS_COUNT = 10
export const MAX_REPLIES_PER_COMMENT_COUNT = 3

export interface DetailedThreadPayload {
  id: string
  title: string
  body: string
  date: Date
  username: string
  comments: Comments
}

class DetailedThread extends DomainEntity<DetailedThreadPayload> {
  get id(): string { return this.payload.id }
  get title(): string { return this.payload.title }
  get body(): string { return this.payload.body }
  get date(): Date { return this.payload.date }
  get username(): string { return this.payload.username }
  get comments(): Comments { return this.payload.comments }

  set comments(v: Comments) { this.payload.comments = v }

  protected get entityName(): string {
    return DetailedThread.name
  }

  protected get schema(): Joi.PartialSchemaMap<DetailedThreadPayload> {
    return {
      id: Joi.string().required(),
      title: Joi.string().required(),
      body: Joi.string().required(),
      date: Joi.date().required(),
      username: Joi.string().required(),
      comments: Joi.array().max(MAX_COMMENTS_COUNT).required()
    }
  }

  protected shouldTranslateErrorToClientError(): boolean { return false }
}

export interface CommentWithReplies {
  replies: ReplyWithUsernamePayload[]
}

export type Comments = CommentWithUsernamePayload[] & CommentWithReplies[]

export default DetailedThread

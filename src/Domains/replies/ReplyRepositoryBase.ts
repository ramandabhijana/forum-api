import { type PaginationOptions } from '../../Commons/types/Types'
import { type AddedReplyPayload } from './entities/AddedReply'
import { type ReplyWithUsernamePayload } from './entities/ReplyWithUsername'

abstract class ReplyRepositoryBase {
  abstract addReply(content: string, commentId: string, owner: string): Promise<AddedReplyPayload>
  abstract verifyReplyExists(replyId: string): Promise<void>
  abstract verifyReplyOwner(replyId: string, owner: string): Promise<void>
  abstract getRepliesWithUsernameByCommentId(commentId: string, options?: Partial<PaginationOptions>): Promise<ReplyWithUsernamePayload[]>
  abstract deleteReply(replyId: string): Promise<void>
}

export default ReplyRepositoryBase

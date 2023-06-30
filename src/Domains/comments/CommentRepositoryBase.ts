import { type PaginationOptions } from '../../Commons/types/Types'
import { type AddedCommentPayload } from './entities/AddedComment'
import { type CommentWithUsernamePayload } from './entities/CommentWithUsername'

abstract class CommentRepositoryBase {
  abstract addComment(content: string, threadId: string, owner: string): Promise<AddedCommentPayload>
  abstract verifyCommentExists(commentId: string): Promise<void>
  abstract verifyCommentOwner(commentId: string, owner: string): Promise<void>
  abstract getCommentsWithUsernameByThreadId(threadId: string, options?: Partial<PaginationOptions>): Promise<CommentWithUsernamePayload[]>
  abstract deleteComment(commentId: string): Promise<void>
}

export default CommentRepositoryBase

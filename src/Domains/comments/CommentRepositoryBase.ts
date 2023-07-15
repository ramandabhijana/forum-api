import { type PaginationOptions } from '../../Commons/types/Types'
import { type CommentWithReplies, type Comments } from '../threads/entities/DetailedThread'
import { type AddedCommentPayload } from './entities/AddedComment'
import { type CommentWithUsernamePayload } from './entities/CommentWithUsername'

abstract class CommentRepositoryBase {
  abstract addComment(content: string, threadId: string, owner: string): Promise<AddedCommentPayload>
  abstract verifyCommentExists(commentId: string): Promise<void>
  abstract verifyCommentOwner(commentId: string, owner: string): Promise<void>
  abstract getCommentsWithUsernameByThreadId(threadId: string, options?: Partial<PaginationOptions>): Promise<CommentWithUsernamePayload[]>
  abstract getCommentsByThreadId(threadId: string, commentsQueryOptions?: Partial<PaginationOptions>, repliesQueryOptions?: Partial<PaginationOptions>): Promise<Comments>
  abstract getCommentRepliesByCommentIds(commentIds: string[], repliesQueryOptions?: Partial<PaginationOptions>): Promise<Map<string, CommentWithReplies>>
  abstract deleteComment(commentId: string): Promise<void>
}

export default CommentRepositoryBase

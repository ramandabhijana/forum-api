import { type PaginationOptions } from '../../Commons/types/Types'
import { type CommentWithReplies } from '../threads/entities/DetailedThread'
import { type AddedCommentPayload } from './entities/AddedComment'

abstract class CommentRepositoryBase {
  abstract addComment(content: string, threadId: string, owner: string): Promise<AddedCommentPayload>
  abstract verifyCommentExists(commentId: string): Promise<void>
  abstract verifyCommentOwner(commentId: string, owner: string): Promise<void>
  abstract getCommentRepliesByCommentIds(commentIds: string[], repliesQueryOptions?: Partial<PaginationOptions>): Promise<Map<string, CommentWithReplies>>
  abstract deleteComment(commentId: string): Promise<void>
  abstract isCommentLikedBy(userId: string, commentId: string): Promise<boolean>
  abstract likeComment(commentId: string): Promise<void>
  abstract dislikeComment(commentId: string): Promise<void>
}

export default CommentRepositoryBase

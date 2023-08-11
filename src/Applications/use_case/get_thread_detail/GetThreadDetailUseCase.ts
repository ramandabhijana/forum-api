import type CommentRepositoryBase from '../../../Domains/comments/CommentRepositoryBase'
import type ThreadRepositoryBase from '../../../Domains/threads/ThreadRepositoryBase'
import { MAX_COMMENTS_COUNT, MAX_REPLIES_PER_COMMENT_COUNT, type DetailedThreadPayload } from '../../../Domains/threads/entities/DetailedThread'
import { UseCaseBase } from '../UseCaseBase'

class GetThreadDetailUseCase extends UseCaseBase<string, DetailedThreadPayload> {
  constructor(
    private readonly threadRepository: ThreadRepositoryBase,
    private readonly commentRepository: CommentRepositoryBase
  ) {
    super()
  }

  async execute(payload: string): Promise<DetailedThreadPayload> {
    await this.threadRepository.verifyThreadExists(payload)
    const thread = await this.threadRepository.getThreadCommentsById(payload, { limit: MAX_COMMENTS_COUNT })

    const commentIds = thread.comments.map(comment => comment.id)
    const commentIdAndReplies = await this.commentRepository.getCommentRepliesByCommentIds(
      commentIds,
      { limit: MAX_REPLIES_PER_COMMENT_COUNT }
    )

    for (const [commentId, replies] of commentIdAndReplies) {
      const index = thread.comments.findIndex(c => c.id === commentId)
      thread.comments[index].replies = replies.replies
    }

    return thread
  }
}

export default GetThreadDetailUseCase

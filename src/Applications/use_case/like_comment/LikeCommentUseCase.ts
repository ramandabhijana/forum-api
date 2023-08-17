import { UseCaseBase } from '../UseCaseBase'
import CommentInteraction, { type CommentInteractionPayload } from '../../../Domains/comments/entities/CommentInteraction'
import type CommentRepositoryBase from '../../../Domains/comments/CommentRepositoryBase'
import type ThreadRepositoryBase from '../../../Domains/threads/ThreadRepositoryBase'

class LikeCommentUseCase extends UseCaseBase<CommentInteractionPayload, void> {
  constructor(
    private readonly threadRepository: ThreadRepositoryBase,
    private readonly commentRepository: CommentRepositoryBase
  ) {
    super()
  }

  async execute(payload: CommentInteractionPayload): Promise<void> {
    const { threadId, commentId, userId } = new CommentInteraction(payload)

    await Promise.all([
      this.threadRepository.verifyThreadExists(threadId),
      this.commentRepository.verifyCommentExists(commentId)
    ])

    const isLiked = await this.commentRepository.isCommentLikedBy(userId, commentId)

    if (isLiked) {
      await this.commentRepository.dislikeComment(commentId)
    } else {
      await this.commentRepository.likeComment(commentId)
    }
  }
}

export default LikeCommentUseCase

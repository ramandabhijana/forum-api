import type CommentRepositoryBase from '../../../Domains/comments/CommentRepositoryBase'
import CommentInteraction, { type CommentInteractionPayload } from '../../../Domains/comments/entities/CommentInteraction'
import type ThreadRepositoryBase from '../../../Domains/threads/ThreadRepositoryBase'
import { UseCaseBase } from '../UseCaseBase'

class DeleteCommentUseCase extends UseCaseBase<CommentInteractionPayload, void> {
  constructor(
    private readonly threadRepository: ThreadRepositoryBase,
    private readonly commentRepository: CommentRepositoryBase
  ) {
    super()
  }

  async execute(payload: CommentInteractionPayload): Promise<void> {
    const { threadId, commentId, userId } = new CommentInteraction(payload)

    const verifyThreadExist = this.threadRepository.verifyThreadExists(threadId)
    const verifyCommentOwner = this.commentRepository.verifyCommentOwner(commentId, userId)
    const verifyCommentExist = this.commentRepository.verifyCommentExists(commentId)

    await Promise.all([verifyThreadExist, verifyCommentOwner, verifyCommentExist])

    await this.commentRepository.deleteComment(commentId)
  }
}

export default DeleteCommentUseCase

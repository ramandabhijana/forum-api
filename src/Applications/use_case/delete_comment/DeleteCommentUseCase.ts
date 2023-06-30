import type CommentRepositoryBase from '../../../Domains/comments/CommentRepositoryBase'
import DeleteComment, { type DeleteCommentPayload } from '../../../Domains/comments/entities/DeleteComment'
import type ThreadRepositoryBase from '../../../Domains/threads/ThreadRepositoryBase'
import { UseCaseBase } from '../UseCaseBase'

class DeleteCommentUseCase extends UseCaseBase<DeleteCommentPayload, void> {
  constructor(
    private readonly threadRepository: ThreadRepositoryBase,
    private readonly commentRepository: CommentRepositoryBase
  ) {
    super()
  }

  async execute(payload: DeleteCommentPayload): Promise<void> {
    const { threadId, commentId, userId } = new DeleteComment(payload)

    const verifyThreadExist = this.threadRepository.verifyThreadExists(threadId)
    const verifyCommentOwner = this.commentRepository.verifyCommentOwner(commentId, userId)
    const verifyCommentExist = this.commentRepository.verifyCommentExists(commentId)

    await Promise.all([verifyThreadExist, verifyCommentOwner, verifyCommentExist])

    await this.commentRepository.deleteComment(commentId)
  }
}

export default DeleteCommentUseCase

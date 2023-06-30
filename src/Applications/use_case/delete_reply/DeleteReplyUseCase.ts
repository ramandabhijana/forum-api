import type CommentRepositoryBase from '../../../Domains/comments/CommentRepositoryBase'
import type ReplyRepositoryBase from '../../../Domains/replies/ReplyRepositoryBase'
import DeleteReply, { type DeleteReplyPayload } from '../../../Domains/replies/entities/DeleteReply'
import type ThreadRepositoryBase from '../../../Domains/threads/ThreadRepositoryBase'
import { UseCaseBase } from '../UseCaseBase'

class DeleteReplyUseCase extends UseCaseBase<DeleteReplyPayload, void> {
  constructor(
    private readonly threadRepository: ThreadRepositoryBase,
    private readonly commentRepository: CommentRepositoryBase,
    private readonly replyRepository: ReplyRepositoryBase
  ) {
    super()
  }

  async execute(payload: DeleteReplyPayload): Promise<void> {
    const { threadId, commentId, replyId, userId } = new DeleteReply(payload)

    const verifyThreadExist = this.threadRepository.verifyThreadExists(threadId)
    const verifyCommentExist = this.commentRepository.verifyCommentExists(commentId)
    const verifyReplyExist = this.replyRepository.verifyReplyExists(replyId)
    const verifyReplyOwner = this.replyRepository.verifyReplyOwner(replyId, userId)

    await Promise.all([verifyThreadExist, verifyCommentExist, verifyReplyExist, verifyReplyOwner])

    await this.replyRepository.deleteReply(replyId)
  }
}

export default DeleteReplyUseCase

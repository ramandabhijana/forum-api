import type CommentRepositoryBase from '../../../Domains/comments/CommentRepositoryBase'
import type ReplyRepositoryBase from '../../../Domains/replies/ReplyRepositoryBase'
import { type AddedReplyPayload } from '../../../Domains/replies/entities/AddedReply'
import NewReply, { type NewReplyPayload } from '../../../Domains/replies/entities/NewReply'
import type ThreadRepositoryBase from '../../../Domains/threads/ThreadRepositoryBase'
import { UseCaseBase } from '../UseCaseBase'

class AddReplyUseCase extends UseCaseBase<NewReplyPayload, AddedReplyPayload> {
  constructor(
    private readonly replyRepository: ReplyRepositoryBase,
    private readonly threadRepository: ThreadRepositoryBase,
    private readonly commentRepository: CommentRepositoryBase
  ) {
    super()
  }

  async execute(payload: NewReplyPayload): Promise<AddedReplyPayload> {
    const { threadId, commentId, content, userId } = new NewReply(payload)

    const verifyThreadExistsPromise = this.threadRepository.verifyThreadExists(threadId)
    const verifyCommentExistsPromise = this.commentRepository.verifyCommentExists(commentId)
    await Promise.all([verifyThreadExistsPromise, verifyCommentExistsPromise])

    return await this.replyRepository.addReply(content, commentId, userId)
  }
}

export default AddReplyUseCase

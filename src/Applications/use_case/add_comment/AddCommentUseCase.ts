import type CommentRepositoryBase from '../../../Domains/comments/CommentRepositoryBase'
import { type AddedCommentPayload } from '../../../Domains/comments/entities/AddedComment'
import NewComment, { type NewCommentPayload } from '../../../Domains/comments/entities/NewComment'
import type ThreadRepositoryBase from '../../../Domains/threads/ThreadRepositoryBase'
import { UseCaseBase } from '../UseCaseBase'

class AddCommentUseCase extends UseCaseBase<NewCommentPayload, AddedCommentPayload> {
  constructor(
    private readonly commentRepository: CommentRepositoryBase,
    private readonly threadRepository: ThreadRepositoryBase
  ) {
    super()
  }

  async execute(payload: NewCommentPayload): Promise<AddedCommentPayload> {
    const { content, threadId, userId } = new NewComment(payload)
    await this.threadRepository.verifyThreadExists(threadId)
    return await this.commentRepository.addComment(content, threadId, userId)
  }
}

export default AddCommentUseCase

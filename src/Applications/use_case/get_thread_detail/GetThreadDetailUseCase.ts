import type CommentRepositoryBase from '../../../Domains/comments/CommentRepositoryBase'
import type ReplyRepositoryBase from '../../../Domains/replies/ReplyRepositoryBase'
import type ThreadRepositoryBase from '../../../Domains/threads/ThreadRepositoryBase'
import DetailedThread, { MAX_COMMENTS_COUNT, MAX_REPLIES_PER_COMMENT_COUNT, type DetailedThreadPayload } from '../../../Domains/threads/entities/DetailedThread'
import { UseCaseBase } from '../UseCaseBase'

class GetThreadDetailUseCase extends UseCaseBase<string, DetailedThreadPayload> {
  constructor(
    private readonly threadRepository: ThreadRepositoryBase,
    private readonly commentRepository: CommentRepositoryBase,
    private readonly replyRepository: ReplyRepositoryBase
  ) {
    super()
  }

  async execute(payload: string): Promise<DetailedThreadPayload> {
    await this.threadRepository.verifyThreadExists(payload)

    const threadPromise = this.threadRepository.getThreadWithUsernameById(payload)
    const commentsPromise = this.commentRepository.getCommentsByThreadId(payload, { limit: MAX_COMMENTS_COUNT }, { limit: MAX_REPLIES_PER_COMMENT_COUNT })
    const [thread, comments] = await Promise.all([threadPromise, commentsPromise])

    return new DetailedThread({ ...thread, comments }).asObject
  }
}

export default GetThreadDetailUseCase

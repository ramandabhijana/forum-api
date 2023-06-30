import { IsNull, type Repository } from 'typeorm'
import ReplyRepositoryBase from '../../../Domains/replies/ReplyRepositoryBase'
import { type AppDataSource } from '../../database/data-source'
import AddedReply, { type AddedReplyPayload } from '../../../Domains/replies/entities/AddedReply'
import { Reply } from './model/Reply'
import { type PaginationOptions } from '../../../Commons/types/Types'
import ReplyWithUsername, { type ReplyWithUsernamePayload } from '../../../Domains/replies/entities/ReplyWithUsername'
import NotFoundError from '../../../Commons/exceptions/NotFoundError'
import { REPLY_NOT_FOUND, REPLY_OWNER_NOT_AUTHORIZED } from '../../../Commons/exceptions/messages/ErrorMessages'
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError'

class ReplyRepository extends ReplyRepositoryBase {
  private readonly repository: Repository<Reply>

  constructor(
    dataSource: AppDataSource,
    private readonly idGenerator: () => string
  ) {
    super()
    this.repository = dataSource.instance.getRepository(Reply)
  }

  async addReply(content: string, commentId: string, owner: string): Promise<AddedReplyPayload> {
    const id = `reply-${this.idGenerator()}`
    const reply = this.repository.create({
      id,
      content,
      replier: { id: owner },
      comment: { id: commentId }
    })
    await this.repository.insert(reply)
    return new AddedReply({ id, content, owner }).asObject
  }

  async getRepliesWithUsernameByCommentId(commentId: string, options?: Partial<PaginationOptions>): Promise<ReplyWithUsernamePayload[]> {
    const limit = options?.limit ?? 10
    const offset = options?.offset ?? 0
    const replies = await this.repository
      .createQueryBuilder('reply')
      .leftJoin('reply.replier', 'replier')
      .select([
        'reply.id',
        'reply.content',
        'reply.createdAt',
        'reply.deletedAt',
        'replier.username'
      ])
      .withDeleted()
      .where('reply.comment_id = :commentId', { commentId })
      .orderBy('reply.createdAt', 'ASC')
      .skip(offset)
      .take(limit)
      .getMany()
    return replies.map(reply =>
      new ReplyWithUsername({
        id: reply.id,
        content: reply.content,
        createdAt: reply.createdAt,
        deletedAt: reply.deletedAt,
        username: reply.replier.username
      }).asObject
    )
  }

  async verifyReplyExists(replyId: string): Promise<void> {
    const reply = await this.repository.findOne({
      where: { id: replyId, deletedAt: IsNull() },
      select: { id: true }
    })
    if (reply === null) {
      throw new NotFoundError(REPLY_NOT_FOUND)
    }
  }

  async verifyReplyOwner(replyId: string, owner: string): Promise<void> {
    const reply = await this.repository.findOne({
      where: { id: replyId },
      relations: { replier: true },
      select: { id: true, replier: { id: true } }
    })
    if (reply === null) {
      throw new NotFoundError(REPLY_NOT_FOUND)
    }
    if (reply.replier.id !== owner) {
      throw new AuthorizationError(REPLY_OWNER_NOT_AUTHORIZED)
    }
  }

  async deleteReply(replyId: string): Promise<void> {
    const result = await this.repository.softDelete({ id: replyId })
    if (result.affected === 0) {
      throw new NotFoundError(REPLY_NOT_FOUND)
    }
  }
}

export default ReplyRepository

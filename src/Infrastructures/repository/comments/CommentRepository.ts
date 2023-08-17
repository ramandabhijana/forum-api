import { IsNull, type Repository } from 'typeorm'
import CommentRepositoryBase from '../../../Domains/comments/CommentRepositoryBase'
import { Comment } from './model/Comment'
import { type AppDataSource } from '../../database/data-source'
import AddedComment, { type AddedCommentPayload } from '../../../Domains/comments/entities/AddedComment'
import NotFoundError from '../../../Commons/exceptions/NotFoundError'
import { COMMENT_NOT_FOUND, COMMENT_OWNER_NOT_AUTHORIZED } from '../../../Commons/exceptions/messages/ErrorMessages'
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError'
import { type PaginationOptions } from '../../../Commons/types/Types'
import { type CommentWithReplies } from '../../../Domains/threads/entities/DetailedThread'
import { Reply } from '../replies/model/Reply'
import ReplyWithUsername from '../../../Domains/replies/entities/ReplyWithUsername'

class CommentRepository extends CommentRepositoryBase {
  private readonly repository: Repository<Comment>
  private readonly replyRepository: Repository<Reply>

  constructor(
    dataSource: AppDataSource,
    private readonly idGenerator: () => string
  ) {
    super()
    this.repository = dataSource.instance.getRepository(Comment)
    this.replyRepository = dataSource.instance.getRepository(Reply)
  }

  async addComment(content: string, threadId: string, owner: string): Promise<AddedCommentPayload> {
    const id = `comment-${this.idGenerator()}`
    const comment = this.repository.create({
      id,
      content,
      commenter: { id: owner },
      thread: { id: threadId }
    })
    await this.repository.insert(comment)
    return new AddedComment({ id, content, owner }).asObject
  }

  async verifyCommentExists(commentId: string): Promise<void> {
    const comment = await this.repository.findOne({
      where: { id: commentId, deletedAt: IsNull() },
      select: { id: true }
    })
    if (comment === null) {
      throw new NotFoundError(COMMENT_NOT_FOUND)
    }
  }

  async verifyCommentOwner(commentId: string, owner: string): Promise<void> {
    const comment = await this.repository.findOne({
      where: { id: commentId },
      relations: { commenter: true },
      select: { id: true, commenter: { id: true } }
    })
    if (comment === null) {
      throw new NotFoundError(COMMENT_NOT_FOUND)
    }
    if (comment.commenter.id !== owner) {
      throw new AuthorizationError(COMMENT_OWNER_NOT_AUTHORIZED)
    }
  }

  async deleteComment(commentId: string): Promise<void> {
    const result = await this.repository.softDelete({ id: commentId })
    if (result.affected === 0) {
      throw new NotFoundError(COMMENT_NOT_FOUND)
    }
  }

  async getCommentRepliesByCommentIds(
    commentIds: string[],
    repliesQueryOptions?: Partial<PaginationOptions>
  ): Promise<Map<string, CommentWithReplies>> {
    const repliesLimit = repliesQueryOptions?.limit ?? 10
    const repliesOffset = repliesQueryOptions?.offset ?? 0

    const subQuery = this.replyRepository
      .createQueryBuilder('reply')
      .withDeleted()
      .select('reply.id')
      .where('reply.comment = comment.id')
      .skip(repliesOffset)
      .take(repliesLimit)
      .getQuery()

    const comments: Comment[] = await this.repository.createQueryBuilder('comment')
      .withDeleted()
      .innerJoinAndSelect('comment.replies', 'reply', `reply.id IN (${subQuery})`)
      .leftJoinAndSelect('reply.replier', 'replier')
      .select([
        'comment.id',
        'reply.id',
        'reply.content',
        'reply.createdAt',
        'reply.deletedAt',
        'replier.username'
      ])
      .where('comment.id = ANY (:commentIds)', { commentIds })
      .orderBy('reply.createdAt', 'ASC')
      .getMany()

    return comments.reduce((map, comment) => {
      const replies = comment.replies
        .map(r => new ReplyWithUsername({
          id: r.id,
          content: r.content,
          createdAt: r.createdAt,
          deletedAt: r.deletedAt,
          username: r.replier.username
        }).asObject)
      map.set(comment.id, { replies })
      return map
    }, new Map<string, CommentWithReplies>())
  }

  async isCommentLikedBy(userId: string, commentId: string): Promise<boolean> {
    const comment = await this.repository.findOne({
      relations: { likers: true },
      where: {
        id: commentId,
        likers: { id: userId }
      },
      select: { id: true }
    })
    return comment !== null
  }

  async likeComment(commentId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  async dislikeComment(commentId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
}

export default CommentRepository

import { IsNull, type Repository } from 'typeorm'
import CommentRepositoryBase from '../../../Domains/comments/CommentRepositoryBase'
import { Comment } from './model/Comment'
import { type AppDataSource } from '../../database/data-source'
import AddedComment, { type AddedCommentPayload } from '../../../Domains/comments/entities/AddedComment'
import NotFoundError from '../../../Commons/exceptions/NotFoundError'
import { COMMENT_NOT_FOUND, COMMENT_OWNER_NOT_AUTHORIZED } from '../../../Commons/exceptions/messages/ErrorMessages'
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError'
import { type PaginationOptions } from '../../../Commons/types/Types'
import CommentWithUsername, { type CommentWithUsernamePayload } from '../../../Domains/comments/entities/CommentWithUsername'
import { type CommentWithReplies, type Comments } from '../../../Domains/threads/entities/DetailedThread'
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

  async getCommentsByThreadId(threadId: string, commentsQueryOptions?: Partial<PaginationOptions>, repliesQueryOptions?: Partial<PaginationOptions>): Promise<Comments> {
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

    const commentsLimit = commentsQueryOptions?.limit ?? 10
    const commentsOffset = commentsQueryOptions?.offset ?? 0
    const comments = await this.repository.createQueryBuilder('comment')
      .withDeleted()
      .leftJoinAndSelect('comment.commenter', 'commenter')
      .leftJoinAndSelect('comment.replies', 'reply', `reply.id IN (${subQuery})`)
      .leftJoinAndSelect('reply.replier', 'replier')
      .select([
        'comment.id',
        'comment.content',
        'comment.createdAt',
        'comment.deletedAt',
        'commenter.username',
        'reply.id',
        'reply.content',
        'reply.createdAt',
        'reply.deletedAt',
        'replier.username'
      ])
      .where('comment.thread_id = :threadId', { threadId })
      .orderBy('comment.createdAt', 'ASC')
      .skip(commentsOffset)
      .take(commentsLimit)
      .getMany()

    return comments.map(commentEntity => {
      const comment = new CommentWithUsername({
        id: commentEntity.id,
        content: commentEntity.content,
        createdAt: commentEntity.createdAt,
        deletedAt: commentEntity.deletedAt,
        username: commentEntity.commenter.username
      }).asObject

      // Strange behavior, the `take` expr applied to comments is not functioning properly when `addOrderBy` is used to sort replies
      // Try add `.addOrderBy('reply.createdAt', 'ASC')` after `orderBy` was called
      // Decided to sort replies using standard js sort array method.
      // This implies that `getCommentsByThreadId` shall not be provided with large number to limit the replies returned
      const replies = commentEntity.replies
        .map(replyEntity => new ReplyWithUsername({
          id: replyEntity.id,
          content: replyEntity.content,
          createdAt: replyEntity.createdAt,
          deletedAt: replyEntity.deletedAt,
          username: replyEntity.replier.username
        }).asObject)
        .sort((lhs, rhs) => lhs.date.getTime() - rhs.date.getTime())

      return { ...comment, replies }
    })
  }

  async getCommentsWithUsernameByThreadId(threadId: string, options?: Partial<PaginationOptions>): Promise<CommentWithUsernamePayload[]> {
    const limit = options?.limit ?? 10
    const offset = options?.offset ?? 0

    const comments = await this.repository
      .createQueryBuilder('comment')
      .leftJoin('comment.commenter', 'commenter')
      .select([
        'comment.id',
        'comment.content',
        'comment.createdAt',
        'comment.deletedAt',
        'commenter.username'
      ])
      .withDeleted()
      .where('comment.thread_id = :threadId', { threadId })
      .orderBy('comment.createdAt', 'ASC')
      .skip(offset)
      .take(limit)
      .getMany()

    return comments.map(comment =>
      new CommentWithUsername({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        deletedAt: comment.deletedAt,
        username: comment.commenter.username
      }).asObject
    )
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
}

export default CommentRepository

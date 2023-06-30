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

class CommentRepository extends CommentRepositoryBase {
  private readonly repository: Repository<Comment>

  constructor(
    dataSource: AppDataSource,
    private readonly idGenerator: () => string
  ) {
    super()
    this.repository = dataSource.instance.getRepository(Comment)
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
}

export default CommentRepository

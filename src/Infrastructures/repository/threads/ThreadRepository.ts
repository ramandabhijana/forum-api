import { IsNull, type Repository } from 'typeorm'
import ThreadRepositoryBase from '../../../Domains/threads/ThreadRepositoryBase'
import { Thread } from './model/Thread'
import { type AppDataSource } from '../../database/data-source'
import AddedThread, { type AddedThreadPayload } from '../../../Domains/threads/entities/AddedThread'
import NotFoundError from '../../../Commons/exceptions/NotFoundError'
import { THREAD_NOT_FOUND } from '../../../Commons/exceptions/messages/ErrorMessages'
import ThreadWithUsername, { type ThreadWithUsernamePayload } from '../../../Domains/threads/entities/ThreadWithUsername'
import DetailedThread, { type DetailedThreadPayload } from '../../../Domains/threads/entities/DetailedThread'
import { type PaginationOptions } from '../../../Commons/types/Types'
import CommentWithUsername from '../../../Domains/comments/entities/CommentWithUsername'

class ThreadRepository extends ThreadRepositoryBase {
  private readonly repository: Repository<Thread>

  constructor(
    dataSource: AppDataSource,
    private readonly idGenerator: () => string
  ) {
    super()
    this.repository = dataSource.instance.getRepository(Thread)
  }

  async addThread(title: string, body: string, owner: string): Promise<AddedThreadPayload> {
    const id = `thread-${this.idGenerator()}`
    const thread = this.repository.create({
      id,
      title,
      body,
      owner: { id: owner }
    })
    await this.repository.insert(thread)
    return new AddedThread({ id, owner, title }).asObject
  }

  async verifyThreadExists(threadId: string): Promise<void> {
    const thread = await this.repository.findOne({
      where: {
        id: threadId,
        deletedAt: IsNull()
      },
      select: { id: true }
    })
    if (thread === null) {
      throw new NotFoundError(THREAD_NOT_FOUND)
    }
  }

  async getThreadWithUsernameById(threadId: string): Promise<ThreadWithUsernamePayload> {
    const thread = await this.repository
      .createQueryBuilder('thread')
      .leftJoinAndSelect('thread.owner', 'owner')
      .select([
        'thread.id',
        'thread.title',
        'thread.body',
        'thread.createdAt',
        'owner.username'
      ])
      .where('thread.id = :threadId', { threadId })
      .getOne()
    if (thread == null) {
      throw new NotFoundError(THREAD_NOT_FOUND)
    }
    const { id, title, body, createdAt, owner } = thread
    return new ThreadWithUsername({ id, title, body, date: createdAt, username: owner.username }).asObject
  }

  async getThreadCommentsById(threadId: string, commentsQueryOptions?: Partial<PaginationOptions>): Promise<DetailedThreadPayload> {
    const commentsLimit = commentsQueryOptions?.limit ?? 10
    const commentsOffset = commentsQueryOptions?.offset ?? 0

    const threads = await this.repository
      .createQueryBuilder('thread')
      .withDeleted()
      .leftJoinAndSelect('thread.owner', 'owner')
      .leftJoinAndSelect('thread.comments', 'comment')
      .leftJoinAndSelect('comment.commenter', 'commenter')
      .select([
        'thread.id',
        'thread.title',
        'thread.body',
        'thread.createdAt',
        'owner.username',
        'comment.id',
        'comment.content',
        'comment.createdAt',
        'comment.deletedAt',
        'commenter.username'
      ])
      .where('thread.id = :threadId', { threadId })
      .orderBy('comment.createdAt', 'ASC')
      .limit(commentsLimit)
      .offset(commentsOffset)
      .getMany()

    if (threads.length === 0) {
      throw new NotFoundError(THREAD_NOT_FOUND)
    }

    const comments = threads
      .flatMap(t => t.comments)
      .map(c => new CommentWithUsername({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        deletedAt: c.deletedAt,
        username: c.commenter.username
      }).asObject)
      .map(c => ({ ...c, replies: [] }))

    const { id, title, body, createdAt, owner } = threads[0]
    const thread = new ThreadWithUsername({
      id,
      title,
      body,
      date: createdAt,
      username: owner.username
    }).asObject

    return new DetailedThread({ ...thread, comments }).asObject
  }
}

export default ThreadRepository

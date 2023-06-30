import { IsNull, type Repository } from 'typeorm'
import ThreadRepositoryBase from '../../../Domains/threads/ThreadRepositoryBase'
import { Thread } from './model/Thread'
import { type AppDataSource } from '../../database/data-source'
import AddedThread, { type AddedThreadPayload } from '../../../Domains/threads/entities/AddedThread'
import NotFoundError from '../../../Commons/exceptions/NotFoundError'
import { THREAD_NOT_FOUND } from '../../../Commons/exceptions/messages/ErrorMessages'
import ThreadWithUsername, { type ThreadWithUsernamePayload } from '../../../Domains/threads/entities/ThreadWithUsername'

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
}

export default ThreadRepository

import { type AddedThreadPayload } from './entities/AddedThread'
import { type ThreadWithUsernamePayload } from './entities/ThreadWithUsername'
import { type DetailedThreadPayload } from './entities/DetailedThread'
import { type PaginationOptions } from '../../Commons/types/Types'

abstract class ThreadRepositoryBase {
  abstract addThread(title: string, body: string, owner: string): Promise<AddedThreadPayload>
  abstract verifyThreadExists(threadId: string): Promise<void>
  abstract getThreadWithUsernameById(threadId: string): Promise<ThreadWithUsernamePayload>
  abstract getThreadCommentsById(threadId: string, commentsQueryOptions?: Partial<PaginationOptions>): Promise<DetailedThreadPayload>
}

export default ThreadRepositoryBase

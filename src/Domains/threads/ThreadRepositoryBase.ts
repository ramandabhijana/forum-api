import { type AddedThreadPayload } from './entities/AddedThread'
import { type ThreadWithUsernamePayload } from './entities/ThreadWithUsername'

abstract class ThreadRepositoryBase {
  abstract addThread(title: string, body: string, owner: string): Promise<AddedThreadPayload>
  abstract verifyThreadExists(threadId: string): Promise<void>
  abstract getThreadWithUsernameById(threadId: string): Promise<ThreadWithUsernamePayload>
}

export default ThreadRepositoryBase

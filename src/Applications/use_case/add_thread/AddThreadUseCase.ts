import type ThreadRepositoryBase from '../../../Domains/threads/ThreadRepositoryBase'
import { type AddedThreadPayload } from '../../../Domains/threads/entities/AddedThread'
import NewThread, { type NewThreadPayload } from '../../../Domains/threads/entities/NewThread'
import { UseCaseBase } from '../UseCaseBase'

class AddThreadUseCase extends UseCaseBase<NewThreadPayload, AddedThreadPayload> {
  constructor(private readonly threadRepository: ThreadRepositoryBase) {
    super()
  }

  async execute(payload: NewThreadPayload): Promise<AddedThreadPayload> {
    const { body, title, userId } = new NewThread(payload)
    return await this.threadRepository.addThread(title, body, userId)
  }
}

export default AddThreadUseCase

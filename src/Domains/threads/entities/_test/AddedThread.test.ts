import AddedThread, { type AddedThreadPayload } from '../AddedThread'
import { DATA_TYPE_OBJECT_EXPECTED, DATA_TYPE_STRING_EXPECTED, MISSING_REQUIRED_PROPERTY, STRING_EMPTY } from '../../../../Commons/exceptions/consts/DomainErrorConsts'

describe('an AddedThread entity', () => {
  it('should throw an error when payload does not contain required property', () => {
    // Arrange
    const payload: any = null
    const payload1: any = {}
    const payload2: any = {
      id: 'thread-123',
      owner: 'user-8912'
    }
    const payload3: any = {
      id: 'thread',
      title: 'a thread'
    }
    const payload4: any = {
      title: 'a thread',
      owner: 'user-8912'
    }

    // Action and Assert
    expect(() => new AddedThread(payload))
      .toThrowError(`AddedThread.${DATA_TYPE_OBJECT_EXPECTED}`)
    expect(() => new AddedThread(payload1))
      .toThrowError(`AddedThread.${MISSING_REQUIRED_PROPERTY}."id"`)
    expect(() => new AddedThread(payload2))
      .toThrowError(`AddedThread.${MISSING_REQUIRED_PROPERTY}."title"`)
    expect(() => new AddedThread(payload3))
      .toThrowError(`AddedThread.${MISSING_REQUIRED_PROPERTY}."owner"`)
    expect(() => new AddedThread(payload4))
      .toThrowError(`AddedThread.${MISSING_REQUIRED_PROPERTY}."id"`)
  })

  it('should throw an error when payload does not meet data type specification', () => {
    // Arrange
    const payload1: AddedThreadPayload = {
      id: 123456,
      title: 'a thread',
      owner: 'user-123'
    } as any
    const payload2: AddedThreadPayload = {
      id: 'thread-123456',
      title: false,
      owner: 'user-123'
    } as any
    const payload3: AddedThreadPayload = {
      id: 'thread-123456',
      title: 'false',
      owner: [121212]
    } as any

    // Action and Assert
    expect(() => new AddedThread(payload1))
      .toThrowError(`AddedThread.${DATA_TYPE_STRING_EXPECTED}."id"`)
    expect(() => new AddedThread(payload2))
      .toThrowError(`AddedThread.${DATA_TYPE_STRING_EXPECTED}."title"`)
    expect(() => new AddedThread(payload3))
      .toThrowError(`AddedThread.${DATA_TYPE_STRING_EXPECTED}."owner"`)
  })

  it('should throw an error when payload contains empty string value', () => {
    // Arrange
    const payload1: AddedThreadPayload = {
      id: '',
      title: 'a thread',
      owner: 'user-123'
    }
    const payload2: AddedThreadPayload = {
      id: 'thread-123456',
      title: '',
      owner: 'user-123'
    }
    const payload3: AddedThreadPayload = {
      id: 'thread-123456',
      title: 'false',
      owner: ''
    }

    // Action and Assert
    expect(() => new AddedThread(payload1))
      .toThrowError(`AddedThread.${STRING_EMPTY}."id"`)
    expect(() => new AddedThread(payload2))
      .toThrowError(`AddedThread.${STRING_EMPTY}."title"`)
    expect(() => new AddedThread(payload3))
      .toThrowError(`AddedThread.${STRING_EMPTY}."owner"`)
  })

  it('should create an AddedThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123456',
      title: 'A thread',
      owner: 'user-123'
    }

    // Action
    const { id, title, owner } = new AddedThread(payload)

    // Assert
    expect(id).toEqual(payload.id)
    expect(title).toEqual(payload.title)
    expect(owner).toEqual(payload.owner)
  })
})

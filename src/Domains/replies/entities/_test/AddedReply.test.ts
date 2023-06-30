import AddedReply, { type AddedReplyPayload } from '../AddedReply'
import { DATA_TYPE_OBJECT_EXPECTED, DATA_TYPE_STRING_EXPECTED, MISSING_REQUIRED_PROPERTY, STRING_EMPTY } from '../../../../Commons/exceptions/consts/DomainErrorConsts'

describe('an AddedReply entity', () => {
  it('should throw an error when payload does not contain required property', () => {
    // Arrange
    const payload: any = null
    const payload1: any = {}
    const payload2: any = {
      id: 'reply-123',
      owner: 'user-8912'
    }
    const payload3: any = {
      id: 'reply-123',
      content: 'a comment'
    }
    const payload4: any = {
      content: 'a reply',
      owner: 'user-8912'
    }

    // Action and Assert
    expect(() => new AddedReply(payload))
      .toThrowError(`AddedReply.${DATA_TYPE_OBJECT_EXPECTED}`)
    expect(() => new AddedReply(payload1))
      .toThrowError(`AddedReply.${MISSING_REQUIRED_PROPERTY}."id"`)
    expect(() => new AddedReply(payload2))
      .toThrowError(`AddedReply.${MISSING_REQUIRED_PROPERTY}."content"`)
    expect(() => new AddedReply(payload3))
      .toThrowError(`AddedReply.${MISSING_REQUIRED_PROPERTY}."owner"`)
    expect(() => new AddedReply(payload4))
      .toThrowError(`AddedReply.${MISSING_REQUIRED_PROPERTY}."id"`)
  })

  it('should throw an error when payload does not meet data type specification', () => {
    // Arrange
    const payload1: AddedReplyPayload = {
      id: 123456,
      content: 'a comment',
      owner: 'user-123'
    } as any
    const payload2: AddedReplyPayload = {
      id: 'reply-123456',
      content: false,
      owner: 'user-123'
    } as any
    const payload3: AddedReplyPayload = {
      id: 'reply-123456',
      content: 'false',
      owner: [121212]
    } as any

    // Action and Assert
    expect(() => new AddedReply(payload1))
      .toThrowError(`AddedReply.${DATA_TYPE_STRING_EXPECTED}."id"`)
    expect(() => new AddedReply(payload2))
      .toThrowError(`AddedReply.${DATA_TYPE_STRING_EXPECTED}."content"`)
    expect(() => new AddedReply(payload3))
      .toThrowError(`AddedReply.${DATA_TYPE_STRING_EXPECTED}."owner"`)
  })

  it('should throw an error when payload contains empty string value', () => {
    // Arrange
    const payload1: AddedReplyPayload = {
      id: '',
      content: 'a reply',
      owner: 'user-123'
    }
    const payload2: AddedReplyPayload = {
      id: 'reply-123456',
      content: '',
      owner: 'user-123'
    }
    const payload3: AddedReplyPayload = {
      id: 'reply-123456',
      content: 'false',
      owner: ''
    }

    // Action and Assert
    expect(() => new AddedReply(payload1))
      .toThrowError(`AddedReply.${STRING_EMPTY}."id"`)
    expect(() => new AddedReply(payload2))
      .toThrowError(`AddedReply.${STRING_EMPTY}."content"`)
    expect(() => new AddedReply(payload3))
      .toThrowError(`AddedReply.${STRING_EMPTY}."owner"`)
  })

  it('should create an AddedReply object correctly', () => {
    // Arrange
    const payload: AddedReplyPayload = {
      id: 'reply-123456',
      content: 'A reply',
      owner: 'user-123'
    }

    // Action
    const addedReply = new AddedReply(payload)
    const { id, content, owner } = addedReply.asObject

    // Assert
    expect(id).toEqual(payload.id)
    expect(content).toEqual(payload.content)
    expect(owner).toEqual(payload.owner)
  })
})

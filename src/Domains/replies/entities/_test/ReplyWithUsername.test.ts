import ReplyWithUsername, { type ConstructorPayload } from '../ReplyWithUsername'
import { DATA_TYPE_DATE_EXPECTED, DATA_TYPE_STRING_EXPECTED, MISSING_REQUIRED_PROPERTY, STRING_EMPTY } from '../../../../Commons/exceptions/consts/DomainErrorConsts'

describe('a ReplyWithUsername entity', () => {
  it('should throw an error when payload does not contain required property', () => {
    // Arrange
    const payload2: Omit<ConstructorPayload, 'id'> = {
      content: 'reply body',
      createdAt: new Date(),
      username: 'username'
    }
    const payload3: Omit<ConstructorPayload, 'content'> = {
      id: 'reply-123',
      username: 'username',
      createdAt: new Date()
    }
    const payload4: Omit<ConstructorPayload, 'createdAt'> = {
      id: 'reply-123',
      username: 'username',
      content: 'reply body'
    }
    const payload5: Omit<ConstructorPayload, 'username'> = {
      id: 'reply-123',
      createdAt: new Date(),
      content: 'reply title'
    }

    // Action and Assert
    expect(() => new ReplyWithUsername(payload2 as any))
      .toThrowError(`ReplyWithUsername.${MISSING_REQUIRED_PROPERTY}."id"`)
    expect(() => new ReplyWithUsername(payload3 as any))
      .toThrowError(`ReplyWithUsername.${MISSING_REQUIRED_PROPERTY}."content"`)
    expect(() => new ReplyWithUsername(payload4 as any))
      .toThrowError(`ReplyWithUsername.${MISSING_REQUIRED_PROPERTY}."date"`)
    expect(() => new ReplyWithUsername(payload5 as any))
      .toThrowError(`ReplyWithUsername.${MISSING_REQUIRED_PROPERTY}."username"`)
  })

  it('should throw an error when payload does not meet data type specification', () => {
    // Arrange
    const payload: ConstructorPayload = {
      id: 'comment-123',
      username: 'username',
      content: 'comment body',
      createdAt: new Date(),
      deletedAt: undefined
    }
    const payload0: ConstructorPayload = {
      ...payload,
      id: 1223
    } as any
    const payload1: ConstructorPayload = {
      ...payload,
      username: ['username']
    } as any
    const payload2: ConstructorPayload = {
      ...payload,
      content: false
    } as any
    const payload3: ConstructorPayload = {
      ...payload,
      createdAt: {}
    } as any

    // Action and Assert
    expect(() => new ReplyWithUsername(payload0))
      .toThrowError(`ReplyWithUsername.${DATA_TYPE_STRING_EXPECTED}."id"`)
    expect(() => new ReplyWithUsername(payload1))
      .toThrowError(`ReplyWithUsername.${DATA_TYPE_STRING_EXPECTED}."username"`)
    expect(() => new ReplyWithUsername(payload2))
      .toThrowError(`ReplyWithUsername.${DATA_TYPE_STRING_EXPECTED}."content"`)
    expect(() => new ReplyWithUsername(payload3))
      .toThrowError(`ReplyWithUsername.${DATA_TYPE_DATE_EXPECTED}."date"`)
  })

  it('should throw an error when payload contains empty string value', () => {
    // Arrange
    const payload: ConstructorPayload = {
      id: 'reply-123',
      username: 'username',
      createdAt: new Date(),
      content: 'reply content',
      deletedAt: undefined
    }
    const payload1: ConstructorPayload = {
      ...payload,
      username: ''
    }
    const payload2: ConstructorPayload = {
      ...payload,
      content: ''
    }
    const payload3: ConstructorPayload = {
      ...payload,
      id: ''
    }

    // Action and Assert
    expect(() => new ReplyWithUsername(payload1))
      .toThrowError(`ReplyWithUsername.${STRING_EMPTY}."username"`)
    expect(() => new ReplyWithUsername(payload2))
      .toThrowError(`ReplyWithUsername.${STRING_EMPTY}."content"`)
    expect(() => new ReplyWithUsername(payload3))
      .toThrowError(`ReplyWithUsername.${STRING_EMPTY}."id"`)
  })

  it('should create a ReplyWithUsername object with a reserved content when the reply is deleted', () => {
    // Arrange
    const payload: ConstructorPayload = {
      id: 'reply-123',
      username: 'username',
      content: 'reply body',
      createdAt: new Date(),
      deletedAt: (() => {
        const tomorrow = new Date()
        tomorrow.setDate(new Date().getDate() + 1)
        return tomorrow
      })()
    }

    // Action
    const { id, content, date, username } = new ReplyWithUsername(payload)

    // Assert
    expect(id).toEqual(payload.id)
    expect(content).toEqual(ReplyWithUsername.DELETED_REPLY_CONTENT)
    expect(date).toEqual(payload.createdAt)
    expect(username).toEqual(payload.username)
  })

  it('should create a ReplyWithUsername object with original content when the comment is not deleted', () => {
    // Arrange
    const payload: ConstructorPayload = {
      id: 'reply-123',
      username: 'username',
      content: 'reply body',
      createdAt: new Date()
    }

    // Action
    const { id, content, date, username } = new ReplyWithUsername(payload)

    // Assert
    expect(id).toEqual(payload.id)
    expect(content).toEqual(payload.content)
    expect(date).toEqual(payload.createdAt)
    expect(username).toEqual(payload.username)
  })
})

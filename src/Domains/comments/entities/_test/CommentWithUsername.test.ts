import CommentWithUsername, { type ConstructorPayload } from '../CommentWithUsername'
import { DATA_TYPE_DATE_EXPECTED, DATA_TYPE_NUMBER_EXPECTED, DATA_TYPE_STRING_EXPECTED, MISSING_REQUIRED_PROPERTY, NUMBER_TYPE_INTEGER_EXPECTED, STRING_EMPTY } from '../../../../Commons/exceptions/consts/DomainErrorConsts'

describe('a CommentWithUsername entity', () => {
  it('should throw an error when payload does not contain required property', () => {
    // Arrange
    const payload2: Omit<ConstructorPayload, 'id'> = {
      content: 'comment body',
      createdAt: new Date(),
      username: 'username',
      likeCount: 0
    }
    const payload3: Omit<ConstructorPayload, 'content'> = {
      id: 'comment-123',
      username: 'username',
      createdAt: new Date(),
      likeCount: 0
    }
    const payload4: Omit<ConstructorPayload, 'createdAt'> = {
      id: 'comment-123',
      username: 'username',
      content: 'comment body',
      likeCount: 0
    }
    const payload5: Omit<ConstructorPayload, 'username'> = {
      id: 'comment-123',
      createdAt: new Date(),
      content: 'comment title',
      likeCount: 0
    }
    const payload6: Omit<ConstructorPayload, 'likeCount'> = {
      id: 'comment-123',
      createdAt: new Date(),
      content: 'comment title',
      username: 'user-123'
    }

    // Action and Assert
    expect(() => new CommentWithUsername(payload2 as any))
      .toThrowError(`CommentWithUsername.${MISSING_REQUIRED_PROPERTY}."id"`)
    expect(() => new CommentWithUsername(payload3 as any))
      .toThrowError(`CommentWithUsername.${MISSING_REQUIRED_PROPERTY}."content"`)
    expect(() => new CommentWithUsername(payload4 as any))
      .toThrowError(`CommentWithUsername.${MISSING_REQUIRED_PROPERTY}."date"`)
    expect(() => new CommentWithUsername(payload5 as any))
      .toThrowError(`CommentWithUsername.${MISSING_REQUIRED_PROPERTY}."username"`)
    expect(() => new CommentWithUsername(payload6 as any))
      .toThrowError(`CommentWithUsername.${MISSING_REQUIRED_PROPERTY}."likeCount"`)
  })

  it('should throw an error when payload does not meet data type specification', () => {
    // Arrange
    const payload: ConstructorPayload = {
      id: 'comment-123',
      username: 'username',
      content: 'comment body',
      createdAt: new Date(),
      deletedAt: undefined,
      likeCount: 0
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
    const payload4: ConstructorPayload = {
      ...payload,
      likeCount: '12f'
    } as any
    const payload5: ConstructorPayload = {
      ...payload,
      likeCount: 0.5
    } as any

    // Action and Assert
    expect(() => new CommentWithUsername(payload0))
      .toThrowError(`CommentWithUsername.${DATA_TYPE_STRING_EXPECTED}."id"`)
    expect(() => new CommentWithUsername(payload1))
      .toThrowError(`CommentWithUsername.${DATA_TYPE_STRING_EXPECTED}."username"`)
    expect(() => new CommentWithUsername(payload2))
      .toThrowError(`CommentWithUsername.${DATA_TYPE_STRING_EXPECTED}."content"`)
    expect(() => new CommentWithUsername(payload3))
      .toThrowError(`CommentWithUsername.${DATA_TYPE_DATE_EXPECTED}."date"`)
    expect(() => new CommentWithUsername(payload4))
      .toThrowError(`CommentWithUsername.${DATA_TYPE_NUMBER_EXPECTED}."likeCount"`)
    expect(() => new CommentWithUsername(payload5))
      .toThrowError(`CommentWithUsername.${NUMBER_TYPE_INTEGER_EXPECTED}."likeCount"`)
  })

  it('should throw an error when payload contains empty string value', () => {
    // Arrange
    const payload: ConstructorPayload = {
      id: 'comment-123',
      username: 'username',
      createdAt: new Date(),
      content: 'comment content',
      deletedAt: undefined,
      likeCount: 0
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
    expect(() => new CommentWithUsername(payload1))
      .toThrowError(`CommentWithUsername.${STRING_EMPTY}."username"`)
    expect(() => new CommentWithUsername(payload2))
      .toThrowError(`CommentWithUsername.${STRING_EMPTY}."content"`)
    expect(() => new CommentWithUsername(payload3))
      .toThrowError(`CommentWithUsername.${STRING_EMPTY}."id"`)
  })

  it('should create a CommentWithUsername object with a reserved content when the comment is deleted', () => {
    // Arrange
    const payload: ConstructorPayload = {
      id: 'comment-123',
      username: 'username',
      content: 'comment body',
      createdAt: new Date(),
      deletedAt: (() => {
        const tomorrow = new Date()
        tomorrow.setDate(new Date().getDate() + 1)
        return tomorrow
      })(),
      likeCount: 0
    }

    // Action
    const { id, content, date, username } = new CommentWithUsername(payload)

    // Assert
    expect(id).toEqual(payload.id)
    expect(content).toEqual(CommentWithUsername.DELETED_COMMENT_CONTENT)
    expect(date).toEqual(payload.createdAt)
    expect(username).toEqual(payload.username)
  })

  it('should create a CommentWithUsername object with original content when the comment is not deleted', () => {
    // Arrange
    const payload: ConstructorPayload = {
      id: 'comment-123',
      username: 'username',
      content: 'comment body',
      createdAt: new Date(),
      likeCount: 0
    }

    // Action
    const { id, content, date, username } = new CommentWithUsername(payload)

    // Assert
    expect(id).toEqual(payload.id)
    expect(content).toEqual(payload.content)
    expect(date).toEqual(payload.createdAt)
    expect(username).toEqual(payload.username)
  })
})

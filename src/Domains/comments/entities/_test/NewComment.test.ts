import NewComment, { type NewCommentPayload } from '../NewComment'
import { DomainErrorTranslator } from '../../../../Commons/exceptions/DomainErrorTranslator'
import { DATA_TYPE_OBJECT_EXPECTED, DATA_TYPE_STRING_EXPECTED, MAX_LIMIT_CHAR, MISSING_REQUIRED_PROPERTY, STRING_EMPTY } from '../../../../Commons/exceptions/consts/DomainErrorConsts'

describe('a NewComment entity', () => {
  const errorMap = DomainErrorTranslator.instance.dictionary

  it('should throw an error when payload does not contain required property', () => {
    // Arrange
    const payload: any = null
    const payload1: any = {}
    const payload2: any = { content: 'a comment' }
    const payload3: any = { content: 'a comment', threadId: 'thread-123' }

    // Action and Assert
    expect(() => new NewComment(payload))
      .toThrowError(errorMap.get(DATA_TYPE_OBJECT_EXPECTED))
    expect(() => new NewComment(payload1))
      .toThrowError(`${errorMap.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "content")`)
    expect(() => new NewComment(payload2))
      .toThrowError(`${errorMap.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "threadId")`)
    expect(() => new NewComment(payload3))
      .toThrowError(`${errorMap.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "userId")`)
  })

  it('should throw an error when payload does not meet data type specification', () => {
    // Arrange
    const payload: NewCommentPayload = {
      content: false,
      threadId: 'thread-123',
      userId: 'user-123'
    } as any
    const payload1: NewCommentPayload = {
      content: 'sebuah komentar',
      threadId: 12344,
      userId: 'user-123'
    } as any
    const payload2: NewCommentPayload = {
      content: 'a comment',
      threadId: 'thread-123',
      userId: new Date()
    } as any

    // Action and Assert
    expect(() => new NewComment(payload))
      .toThrowError(`${errorMap.get(DATA_TYPE_STRING_EXPECTED) as string}. (property: "content")`)
    expect(() => new NewComment(payload1))
      .toThrowError(`${errorMap.get(DATA_TYPE_STRING_EXPECTED) as string}. (property: "threadId")`)
    expect(() => new NewComment(payload2))
      .toThrowError(`${errorMap.get(DATA_TYPE_STRING_EXPECTED) as string}. (property: "userId")`)
  })

  it('should throw an error when the number of characters for content is more than 150 characters or less than 1', () => {
    // Arrange
    const payload: NewCommentPayload = {
      content: 'replyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreplyreply',
      threadId: 'thread-123',
      userId: 'user-123'
    }
    const payload1: NewCommentPayload = {
      content: '',
      threadId: 'thread-123',
      userId: 'user-123'
    }

    // Action and Assert
    expect(() => new NewComment(payload))
      .toThrowError(`${errorMap.get(MAX_LIMIT_CHAR) as string}. (property: "content")`)
    expect(() => new NewComment(payload1))
      .toThrowError(`${errorMap.get(STRING_EMPTY) as string}. (property: "content")`)
  })

  it('should create a NewComment object correctly', () => {
    // Arrange
    const payload: NewCommentPayload = {
      content: 'this is a reply',
      threadId: 'thread-123',
      userId: 'user-123'
    }

    // Action
    const { content, threadId, userId } = new NewComment(payload)

    // Assert
    expect(content).toEqual(payload.content)
    expect(threadId).toEqual(payload.threadId)
    expect(userId).toEqual(payload.userId)
  })
})

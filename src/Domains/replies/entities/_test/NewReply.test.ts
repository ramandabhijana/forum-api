import NewReply, { type NewReplyPayload } from '../NewReply'
import { DomainErrorTranslator } from '../../../../Commons/exceptions/DomainErrorTranslator'
import { DATA_TYPE_OBJECT_EXPECTED, DATA_TYPE_STRING_EXPECTED, MAX_LIMIT_CHAR, MISSING_REQUIRED_PROPERTY, STRING_EMPTY } from '../../../../Commons/exceptions/consts/DomainErrorConsts'

describe('a NewReply entity', () => {
  const errorMap = DomainErrorTranslator.instance.dictionary

  it('should throw an error when payload does not contain required property', () => {
    // Arrange
    const payload: any = null
    const payload1: any = {}
    const payload2: any = { content: 'a reply' }
    const payload3: any = { content: 'a comment', commentId: 'comment-123' }
    const payload4: any = { content: 'a comment', commentId: 'comment-123', threadId: 'thread-123' }

    // Action and Assert
    expect(() => new NewReply(payload))
      .toThrowError(errorMap.get(DATA_TYPE_OBJECT_EXPECTED))
    expect(() => new NewReply(payload1))
      .toThrowError(`${errorMap.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "content")`)
    expect(() => new NewReply(payload2))
      .toThrowError(`${errorMap.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "commentId")`)
    expect(() => new NewReply(payload3))
      .toThrowError(`${errorMap.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "threadId")`)
    expect(() => new NewReply(payload4))
      .toThrowError(`${errorMap.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "userId")`)
  })

  it('should throw an error when payload does not meet data type specification', () => {
    // Arrange
    const payload: NewReplyPayload = {
      content: false,
      threadId: 'thread-123',
      userId: 'user-123',
      commentId: 'comment-123'
    } as any
    const payload1: NewReplyPayload = {
      content: 'sebuah balasan',
      threadId: 1234 % 5,
      userId: 'user-123',
      commentId: 'comment-123'
    } as any
    const payload2: NewReplyPayload = {
      content: 'sebuah balasan',
      threadId: 'thread-123',
      userId: { userId: true },
      commentId: 'comment-123'
    } as any
    const payload3: NewReplyPayload = {
      content: 'sebuah balasan',
      threadId: 'thread-123',
      userId: 'user-123',
      commentId: [{}]
    } as any

    // Action and Assert
    expect(() => new NewReply(payload))
      .toThrowError(`${errorMap.get(DATA_TYPE_STRING_EXPECTED) as string}. (property: "content")`)
    expect(() => new NewReply(payload1))
      .toThrowError(`${errorMap.get(DATA_TYPE_STRING_EXPECTED) as string}. (property: "threadId")`)
    expect(() => new NewReply(payload2))
      .toThrowError(`${errorMap.get(DATA_TYPE_STRING_EXPECTED) as string}. (property: "userId")`)
    expect(() => new NewReply(payload3))
      .toThrowError(`${errorMap.get(DATA_TYPE_STRING_EXPECTED) as string}. (property: "commentId")`)
  })

  it('should throw an error when the number of characters for content is more than 100 characters or less than 1', () => {
    // Arrange
    const payload: NewReplyPayload = {
      content: 'balasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalasbalas',
      threadId: 'thread-123',
      userId: 'user-123',
      commentId: 'comment-123'
    }
    const payload1: NewReplyPayload = {
      ...payload,
      content: ''
    }

    // Action and Assert
    expect(() => new NewReply(payload))
      .toThrowError(`${errorMap.get(MAX_LIMIT_CHAR) as string}. (property: "content")`)
    expect(() => new NewReply(payload1))
      .toThrowError(`${errorMap.get(STRING_EMPTY) as string}. (property: "content")`)
  })

  it('should create a NewReply object correctly', () => {
    // Arrange
    const payload: NewReplyPayload = {
      content: 'this is a reply',
      threadId: 'thread-123',
      userId: 'user-123',
      commentId: 'comment-123'
    }

    // Action
    const { content, threadId, userId, commentId } = new NewReply(payload)

    // Assert
    expect(content).toEqual(payload.content)
    expect(threadId).toEqual(payload.threadId)
    expect(userId).toEqual(payload.userId)
    expect(commentId).toEqual(payload.commentId)
  })
})

import DeleteReply, { type DeleteReplyPayload } from '../DeleteReply'
import { DomainErrorTranslator } from '../../../../Commons/exceptions/DomainErrorTranslator'
import { DATA_TYPE_OBJECT_EXPECTED, DATA_TYPE_STRING_EXPECTED, MISSING_REQUIRED_PROPERTY, STRING_EMPTY } from '../../../../Commons/exceptions/consts/DomainErrorConsts'

describe('a DeleteReply entity', () => {
  const errorMap = DomainErrorTranslator.instance.dictionary

  it('should throw an error when payload does not contain required property', () => {
    // Arrange
    const payload: any = null
    const payload1: any = {}
    const payload2: any = { userId: 'user-123', commentId: 'comment-123', replyId: 'reply-123' }
    const payload3: any = { commentId: 'comment-123', threadId: 'thread-123', replyId: 'reply-123' }
    const payload4: any = { userId: 'user-123', threadId: 'thread-123', replyId: 'reply-123' }
    const payload5: any = { userId: 'user-123', threadId: 'thread-123', commentId: 'comment-123' }

    // Action and Assert
    expect(() => new DeleteReply(payload))
      .toThrowError(errorMap.get(DATA_TYPE_OBJECT_EXPECTED))
    expect(() => new DeleteReply(payload1))
      .toThrowError(`${errorMap.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "threadId")`)
    expect(() => new DeleteReply(payload2))
      .toThrowError(`${errorMap.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "threadId")`)
    expect(() => new DeleteReply(payload3))
      .toThrowError(`${errorMap.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "userId")`)
    expect(() => new DeleteReply(payload4))
      .toThrowError(`${errorMap.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "commentId")`)
    expect(() => new DeleteReply(payload5))
      .toThrowError(`${errorMap.get(MISSING_REQUIRED_PROPERTY) as string}. (property: "replyId")`)
  })

  it('should throw an error when payload does not meet data type specification', () => {
    // Arrange
    const payload: DeleteReplyPayload = {
      commentId: false,
      threadId: 'thread-123',
      userId: 'user-123',
      replyId: 'reply-123'
    } as any
    const payload1: DeleteReplyPayload = {
      commentId: 'comment-123',
      threadId: 12344,
      userId: 'user-123',
      replyId: 'reply-123'
    } as any
    const payload2: DeleteReplyPayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      userId: new Date(),
      replyId: 'reply-123'
    } as any
    const payload3: DeleteReplyPayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      userId: 'user-123',
      replyId: {}
    } as any

    // Action and Assert
    expect(() => new DeleteReply(payload))
      .toThrowError(`${errorMap.get(DATA_TYPE_STRING_EXPECTED) as string}. (property: "commentId")`)
    expect(() => new DeleteReply(payload1))
      .toThrowError(`${errorMap.get(DATA_TYPE_STRING_EXPECTED) as string}. (property: "threadId")`)
    expect(() => new DeleteReply(payload2))
      .toThrowError(`${errorMap.get(DATA_TYPE_STRING_EXPECTED) as string}. (property: "userId")`)
    expect(() => new DeleteReply(payload3))
      .toThrowError(`${errorMap.get(DATA_TYPE_STRING_EXPECTED) as string}. (property: "replyId")`)
  })

  it('should throw an error when payload contains empty string value', () => {
    // Arrange
    const payload: DeleteReplyPayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
      replyId: 'reply-123'
    }
    const payload1: DeleteReplyPayload = {
      ...payload,
      threadId: ''
    }
    const payload2: DeleteReplyPayload = {
      ...payload,
      commentId: ''
    }
    const payload3: DeleteReplyPayload = {
      ...payload,
      userId: ''
    }
    const payload4: DeleteReplyPayload = {
      ...payload,
      replyId: ''
    }

    // Action and Assert
    expect(() => new DeleteReply(payload1))
      .toThrowError(`${errorMap.get(STRING_EMPTY) as string}. (property: "threadId")`)
    expect(() => new DeleteReply(payload2))
      .toThrowError(`${errorMap.get(STRING_EMPTY) as string}. (property: "commentId")`)
    expect(() => new DeleteReply(payload3))
      .toThrowError(`${errorMap.get(STRING_EMPTY) as string}. (property: "userId")`)
    expect(() => new DeleteReply(payload4))
      .toThrowError(`${errorMap.get(STRING_EMPTY) as string}. (property: "replyId")`)
  })

  it('should create a DeleteReply object correctly', () => {
    // Arrange
    const payload: DeleteReplyPayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      userId: 'user-123',
      replyId: 'reply-123'
    }

    // Action
    const { commentId, threadId, userId, replyId } = new DeleteReply(payload)

    // Assert
    expect(commentId).toEqual(payload.commentId)
    expect(threadId).toEqual(payload.threadId)
    expect(userId).toEqual(payload.userId)
    expect(replyId).toEqual(payload.replyId)
  })
})

/* istanbul ignore file */
import { createContainer } from 'instances-container'
import { AppDataSource } from './database/data-source'
import UserRepositoryBase from '../Domains/users/UserRepositoryBase'
import UserRepository from './repository/users/UserRepository'
import { nanoid } from 'nanoid'
import AuthenticationRepositoryBase from '../Domains/authentications/AuthenticationRepositoryBase'
import AuthenticationRepository from './repository/authentications/AuthenticationRepository'
import PasswordHash from '../Applications/security/PasswordHash'
import BcryptPasswordHash from './security/BcryptPasswordHash'
import bcrypt from 'bcrypt'
import AddUserUseCase from '../Applications/use_case/add_user/AddUserUseCase'
import LoginUserUseCase from '../Applications/use_case/login/LoginUserUseCase'
import JwTokenManager from './security/JwTokenManager'
import AuthenticationTokenManager from '../Applications/security/AuthenticationTokenManager'
import hapiAuthJwt from '@hapi/jwt'
import CryptManager from '../Applications/security/CryptManager'
import CryptoManager from './security/CryptoManager'
import { AES } from 'crypto-js'
import AddThreadUseCase from '../Applications/use_case/add_thread/AddThreadUseCase'
import ThreadRepositoryBase from '../Domains/threads/ThreadRepositoryBase'
import ThreadRepository from './repository/threads/ThreadRepository'
import CommentRepositoryBase from '../Domains/comments/CommentRepositoryBase'
import CommentRepository from './repository/comments/CommentRepository'
import ReplyRepositoryBase from '../Domains/replies/ReplyRepositoryBase'
import ReplyRepository from './repository/replies/ReplyRepository'
import AddCommentUseCase from '../Applications/use_case/add_comment/AddCommentUseCase'
import AddReplyUseCase from '../Applications/use_case/add_reply/AddReplyUseCase'
import GetThreadDetailUseCase from '../Applications/use_case/get_thread_detail/GetThreadDetailUseCase'
import LogoutUserUseCase from '../Applications/use_case/logout/LogoutUserUseCase'
import RefreshAuthenticationUseCase from '../Applications/use_case/refresh_authentication/RefreshAuthenticationUseCase'
import DeleteCommentUseCase from '../Applications/use_case/delete_comment/DeleteCommentUseCase'
import DeleteReplyUseCase from '../Applications/use_case/delete_reply/DeleteReplyUseCase'

const container = createContainer()

container.register([
  {
    key: AppDataSource.name,
    Class: AppDataSource
  },
  {
    key: CryptManager.name,
    Class: CryptoManager,
    parameter: {
      dependencies: [
        { concrete: AES }
      ]
    }
  },
  {
    key: AuthenticationTokenManager.name,
    Class: JwTokenManager,
    parameter: {
      dependencies: [
        { concrete: hapiAuthJwt.token },
        { internal: CryptManager.name }
      ]
    }
  },
  {
    key: UserRepositoryBase.name,
    Class: UserRepository,
    parameter: {
      dependencies: [
        { internal: AppDataSource.name },
        { concrete: nanoid }
      ]
    }
  },
  {
    key: AuthenticationRepositoryBase.name,
    Class: AuthenticationRepository,
    parameter: {
      dependencies: [
        { internal: AppDataSource.name }
      ]
    }
  },
  {
    key: ThreadRepositoryBase.name,
    Class: ThreadRepository,
    parameter: {
      dependencies: [
        { internal: AppDataSource.name },
        { concrete: nanoid }
      ]
    }
  },
  {
    key: CommentRepositoryBase.name,
    Class: CommentRepository,
    parameter: {
      dependencies: [
        { internal: AppDataSource.name },
        { concrete: nanoid }
      ]
    }
  },
  {
    key: ReplyRepositoryBase.name,
    Class: ReplyRepository,
    parameter: {
      dependencies: [
        { internal: AppDataSource.name },
        { concrete: nanoid }
      ]
    }
  },
  {
    key: PasswordHash.name,
    Class: BcryptPasswordHash,
    parameter: {
      dependencies: [
        { concrete: bcrypt }
      ]
    }
  }
])

// use cases
container.register([
  {
    key: AddUserUseCase.name,
    Class: AddUserUseCase,
    parameter: {
      dependencies: [
        { internal: UserRepositoryBase.name },
        { internal: PasswordHash.name }
      ]
    }
  },
  {
    key: LoginUserUseCase.name,
    Class: LoginUserUseCase,
    parameter: {
      dependencies: [
        { internal: UserRepositoryBase.name },
        { internal: AuthenticationRepositoryBase.name },
        { internal: AuthenticationTokenManager.name },
        { internal: PasswordHash.name }
      ]
    }
  },
  {
    key: LogoutUserUseCase.name,
    Class: LogoutUserUseCase,
    parameter: {
      dependencies: [
        { internal: AuthenticationRepositoryBase.name }
      ]
    }
  },
  {
    key: RefreshAuthenticationUseCase.name,
    Class: RefreshAuthenticationUseCase,
    parameter: {
      dependencies: [
        { internal: AuthenticationRepositoryBase.name },
        { internal: AuthenticationTokenManager.name }
      ]
    }
  },
  {
    key: AddThreadUseCase.name,
    Class: AddThreadUseCase,
    parameter: {
      dependencies: [
        { internal: ThreadRepositoryBase.name }
      ]
    }
  },
  {
    key: AddCommentUseCase.name,
    Class: AddCommentUseCase,
    parameter: {
      dependencies: [
        { internal: CommentRepositoryBase.name },
        { internal: ThreadRepositoryBase.name }
      ]
    }
  },
  {
    key: DeleteCommentUseCase.name,
    Class: DeleteCommentUseCase,
    parameter: {
      dependencies: [
        { internal: ThreadRepositoryBase.name },
        { internal: CommentRepositoryBase.name }
      ]
    }
  },
  {
    key: AddReplyUseCase.name,
    Class: AddReplyUseCase,
    parameter: {
      dependencies: [
        { internal: ReplyRepositoryBase.name },
        { internal: ThreadRepositoryBase.name },
        { internal: CommentRepositoryBase.name }
      ]
    }
  },
  {
    key: DeleteReplyUseCase.name,
    Class: DeleteReplyUseCase,
    parameter: {
      dependencies: [
        { internal: ThreadRepositoryBase.name },
        { internal: CommentRepositoryBase.name },
        { internal: ReplyRepositoryBase.name }
      ]
    }
  },
  {
    key: GetThreadDetailUseCase.name,
    Class: GetThreadDetailUseCase,
    parameter: {
      dependencies: [
        { internal: ThreadRepositoryBase.name },
        { internal: CommentRepositoryBase.name },
        { internal: ReplyRepositoryBase.name }
      ]
    }
  }
])

export default container

import Hapi, { type Server } from '@hapi/hapi'
import Jwt from '@hapi/jwt'
import { type Container } from 'instances-container'
import { AppDataSource } from '../database/data-source'
import { Config } from '../../Commons/config/server-config'
import CryptManager from '../../Applications/security/CryptManager'
import { users } from '../../Interfaces/http/api/users'
import { authentications } from '../../Interfaces/http/api/authentications'
import { threads } from '../../Interfaces/http/api/threads'
import { comments } from '../../Interfaces/http/api/comments'
import { replies } from '../../Interfaces/http/api/replies'
import setAuthStrategy from './setAuthStrategy'
import handleServerError from './handleServerError'

export const createServer = async function (container: Container): Promise<Server> {
  const config = Config.instance

  const server = Hapi.server({
    host: config.host,
    port: config.port
  })

  handleServerError(server)

  await server.register([
    { plugin: Jwt }
  ])

  const cryptManager: CryptManager = container.getInstance(CryptManager.name)
  setAuthStrategy(server, cryptManager)

  const dataSource: AppDataSource = container.getInstance(AppDataSource.name)
  await dataSource.initialize()

  server.route({
    method: 'GET',
    path: '/',
    handler: (_req, h) => {
      return h.response('ok').code(200)
    }
  })

  await server.register([
    {
      plugin: users,
      options: { container }
    },
    {
      plugin: authentications,
      options: { container }
    },
    {
      plugin: threads,
      options: { container }
    },
    {
      plugin: comments,
      options: { container }
    },
    {
      plugin: replies,
      options: { container }
    }
  ])

  return server
}

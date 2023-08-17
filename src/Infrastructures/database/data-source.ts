/* istanbul ignore file */
import { DataSource } from 'typeorm'
import { Config } from '../../Commons/config/server-config'
import { User } from '../repository/users/model/User'
import { Authentication } from '../repository/authentications/model/Authentication'
import { Thread } from '../repository/threads/model/Thread'
import { Comment } from '../repository/comments/model/Comment'
import { Reply } from '../repository/replies/model/Reply'

export class AppDataSource {
  readonly instance: DataSource

  constructor() {
    const config = Config.instance
    this.instance = new DataSource({
      type: 'postgres',
      host: config.dbHost,
      port: config.dbPort,
      username: config.dbUser,
      password: config.dbPassword,
      database: config.dbName,
      synchronize: true, // don't use in prod
      logging: false,
      ssl: Config.instance.nodeEnv === 'prod' && {
        rejectUnauthorized: false
      },
      entities: [User, Authentication, Thread, Comment, Reply],
      subscribers: [],
      migrations: []
    })
  }

  async initialize(): Promise<void> {
    if (this.instance.isInitialized) return
    await this.instance.initialize()
  }
}

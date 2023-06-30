/* istanbul ignore file */

import dotenv from 'dotenv'

export class Config {
  readonly nodeEnv: string
  readonly host: string
  readonly port: string
  readonly dbHost: string
  readonly dbUser: string
  readonly dbPassword: string
  readonly dbName: string
  readonly dbPort: number
  readonly accessTokenKey: string
  readonly refreshTokenKey: string
  readonly accessTokenAge: string
  readonly cryptKey: string

  private static _instance?: Config

  static get instance(): Config {
    if (Config._instance == null) {
      Config._instance = new Config()
    }
    return Config._instance
  }

  private constructor() {
    this.nodeEnv = Config.getEnv('NODE_ENV')

    this.loadEnv()

    this.host = Config.getEnv('HOST')
    this.port = Config.getEnv('PORT')

    this.dbHost = Config.getEnv('DB_HOST')
    this.dbUser = Config.getEnv('DB_USER')
    this.dbPassword = Config.getEnv('DB_PASSWORD')
    this.dbName = Config.getEnv('DB_NAME')
    this.dbPort = parseInt(Config.getEnv('DB_PORT'))

    this.accessTokenKey = Config.getEnv('ACCESS_TOKEN_KEY')
    this.refreshTokenKey = Config.getEnv('REFRESH_TOKEN_KEY')
    this.accessTokenAge = Config.getEnv('ACCESS_TOKEN_AGE')

    this.cryptKey = Config.getEnv('CRYPT_KEY')
  }

  private static getEnv(name: string): string {
    return process.env[name] as string
  }

  private loadEnv(): void {
    switch (this.nodeEnv) {
      case 'test':
        dotenv.config({ path: './src/Commons/config/.test.env' })
        break
      default:
        dotenv.config({ path: './src/Commons/config/.local.env' })
        break
    }
  }
}

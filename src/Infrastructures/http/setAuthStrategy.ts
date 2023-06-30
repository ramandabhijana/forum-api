/* istanbul ignore file */

import { type Server } from '@hapi/hapi'
import { Config } from '../../Commons/config/server-config'
import type CryptManager from '../../Applications/security/CryptManager'

const setAuthStrategy = function (
  server: Server,
  cryptManager: CryptManager
): void {
  server.auth.strategy('forum_api_jwt', 'jwt', {
    keys: Config.instance.accessTokenKey,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: Config.instance.accessTokenAge
    },
    validate: (artifacts: any) => {
      const encryptedId = artifacts.decoded.payload.id
      const id = cryptManager.decrypt(encryptedId)
      return {
        isValid: true,
        credentials: { id }
      }
    }
  })
}

export default setAuthStrategy

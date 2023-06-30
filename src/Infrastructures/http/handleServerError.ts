/* istanbul ignore file */

import { type Server } from '@hapi/hapi'
import ClientError from '../../Commons/exceptions/ClientError'
import { ERROR_STATUS_RESPONSE, FAIL_STATUS_RESPONSE } from '../../Interfaces/http/constants/HttpResponse'
import { INTERNAL_SERVER_ERROR } from '../../Commons/exceptions/messages/ErrorMessages'
import { Config } from '../../Commons/config/server-config'

const handleServerError = function (server: Server): void {
  server.ext('onPreResponse', (request, h) => {
    const { response } = request

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        return h
          .response({
            status: FAIL_STATUS_RESPONSE,
            message: response.message
          })
          .code(response.statusCode)
      }

      if (!response.isServer) return h.continue

      if (Config.instance.nodeEnv !== 'test') {
        console.error('internal error: ', response)
      }

      return h
        .response({
          status: ERROR_STATUS_RESPONSE,
          message: INTERNAL_SERVER_ERROR
        })
        .code(500)
    }

    return h.continue
  })
}

export default handleServerError

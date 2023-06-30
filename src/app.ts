import { createServer } from './Infrastructures/http/createServer'
import container from './Infrastructures/container'

const startServer = async function (): Promise<void> {
  const server = await createServer(container)
  await server.start()
  console.log(`server is running on ${server.info.uri}`)
}

void startServer()

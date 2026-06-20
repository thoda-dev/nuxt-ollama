import {
  defineEventHandler,
  getMethod,
  getHeader,
  readRawBody,
  setResponseStatus,
  setResponseHeader,
  sendStream,
} from 'h3'
import { useRuntimeConfig } from '#imports'
import type { ModuleOptions } from '../../../module'

export default defineEventHandler(async (event) => {
  const options = useRuntimeConfig().ollama as ModuleOptions

  const ollamaBase = `${options.protocol}://${options.host}${options.port ? `:${options.port}` : ''}`

  // Strip the proxy prefix to recover the original Ollama path (e.g. /api/generate)
  const subpath = event.path.replace(/^\/api\/__ollama/, '')

  const headers: Record<string, string> = {}

  const contentType = getHeader(event, 'content-type')
  if (contentType) headers['content-type'] = contentType

  if (options.api_key) {
    headers['authorization'] = `Bearer ${options.api_key}`
  }

  const body = await readRawBody(event)

  const response = await fetch(`${ollamaBase}${subpath}`, {
    method: getMethod(event),
    headers,
    body: body ?? undefined,
  })

  setResponseStatus(event, response.status)

  const responseContentType = response.headers.get('content-type')
  if (responseContentType) setResponseHeader(event, 'content-type', responseContentType)

  if (!response.body) return null

  return sendStream(event, response.body)
})

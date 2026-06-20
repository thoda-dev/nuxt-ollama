import { Ollama } from 'ollama'
import type { ModuleOptions } from '../../../module'
import { useRuntimeConfig } from '#imports'

export function useOllama() {
  const options: ModuleOptions = useRuntimeConfig().ollama as ModuleOptions
  const headers: Record<string, string> = {}
  if (options.api_key) {
    headers.Authorization = `Bearer ${options.api_key}`
  }
  const host = `${options.protocol}://${options.host}${options.port ? `:${options.port}` : ''}`
  return new Ollama({
    host,
    proxy: options.proxy,
    headers,
  })
}

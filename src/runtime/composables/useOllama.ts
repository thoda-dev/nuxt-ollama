import { Ollama } from 'ollama/browser'
import { useRequestURL } from '#imports'

export function useOllama() {
  const { origin } = useRequestURL()

  return new Ollama({
    host: origin,
    fetch: (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(input.toString())
      return fetch(`${origin}/api/__ollama${url.pathname}`, init)
    },
  })
}

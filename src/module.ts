import { defineNuxtModule, createResolver, addServerImportsDir, addImportsDir, addServerHandler } from '@nuxt/kit'
import { defu } from 'defu'
import type { OllamaOptions } from './types'

// Module options TypeScript interface definition
export interface ModuleOptions extends OllamaOptions {
  protocol: string
  host: string
  port: number | null
  proxy: boolean
  api_key: string | null
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-ollama',
    configKey: 'ollama',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  // Default configuration options of the Nuxt module
  defaults: {
    protocol: 'http',
    host: 'localhost',
    port: null,
    proxy: false,
    api_key: null,
  },
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    // Keep config server-side only — never exposed to the browser
    const runtimeConfig = _nuxt.options.runtimeConfig
    runtimeConfig.ollama = defu(runtimeConfig.ollama as Partial<ModuleOptions> ?? {}, _options)

    addImportsDir(resolver.resolve('./runtime/composables'))
    addServerImportsDir(resolver.resolve('./runtime/server/utils'))

    addServerHandler({
      route: '/api/__ollama/**',
      handler: resolver.resolve('./runtime/server/routes/ollama-proxy'),
    })
  },
})

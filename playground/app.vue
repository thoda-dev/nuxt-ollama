<template>
  <div>
    Nuxt module playground!
    <h2>Models:</h2>
    <div>
      <button @click="refreshList()">
        Refresh Models
      </button>
    </div>
    <ul>
      <li
        v-for="model in list"
        :key="model.name"
      >
        {{ model.name }}
      </li>
    </ul>
    <h2>Chat:</h2>
    <div
      v-for="(m, i) in messages"
      :key="'message_'+i"
    >
      <strong>{{ m.role }}</strong>
      <div
        v-for="(line, index) in m.content.split('\n')"
        :key="`line_${index}`"
      >
        {{ line }}
      </div>
      <hr>
    </div>
    <div>
      <input
        v-model="chatMessage"
        style="width: 100%;margin-top: 5px;"
        @keyup.enter="send"
      >
      <button
        style="margin:5px;"
        @click="send"
      >
        Send
      </button>
      <button
        style="margin:5px;"
        @click="messages.length = 0"
      >
        clear
      </button>
    </div>
  </div>
  <h2>API Fetch Test:</h2>
  <div style="margin-top:50px;">
    <pre>{{ response }}</pre>
    <button @click="refresh()">
      Refresh
    </button>
  </div>
</template>

<script lang="ts" setup>
import type { OllamaMessage } from '../src/types'

const ollama = useOllama()

const chatMessage = ref<string>('')

const messages = ref<OllamaMessage[]>([])

const send = async () => {
  messages.value.push({ role: 'user', content: chatMessage.value })
  chatMessage.value = ''
  const response = await ollama.chat({
    model: 'llama3.2',
    messages: messages.value,
    stream: true,
  })

  const length = messages.value.length

  for await (const part of response) {
    if (messages.value[length] === undefined) {
      messages.value.push({
        created_at: new Date(),
        role: 'assistant',
        content: '',
      })
    }
    if (part.message?.content && messages.value[length]) {
      messages.value[length].content += part.message.content
    }
  }
}

const { data: response, refresh } = useFetch('/api/ollama')

const { data: list, refresh: refreshList } = useFetch('/api/list')
</script>

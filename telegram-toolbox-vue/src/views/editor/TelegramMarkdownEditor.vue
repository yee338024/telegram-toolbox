<script setup lang="ts">
import { asyncComputed } from '@vueuse/core'
import { Marked } from 'marked'
import { nextTick, ref } from 'vue'

const model = defineModel<string>()
const markd = new Marked()
/**
 * **bold**
 * italic*
 * ~~strikethrough~~
 * `code`
 * ```c++
 * code
 * ```
 * [text](url)
 * @param md
 */
async function telegramMarkdownToHtml(md: string): Promise<string> {
  return markd.parse(md)
}

const htmlText = asyncComputed(async () => {
  return telegramMarkdownToHtml(model.value || '')
})

// New: ref to the el-input component so we can access the inner textarea
const inputRef = ref<any>(null)

function getTextarea(): HTMLTextAreaElement | null {
  const comp = inputRef.value
  if (!comp) { return null }
  // Element Plus components expose the DOM via $el; if it's already a native element, use it
  const root = comp.$el ?? comp
  return (root && root.querySelector) ? (root.querySelector('textarea') as HTMLTextAreaElement | null) : null
}

function replaceSelection(prefix: string, suffix = '', placeholder = '') {
  const ta = getTextarea()
  if (!ta) {
    // fallback: operate on model directly
    const sel = model.value || ''
    model.value = `${prefix}${sel || placeholder}${suffix}`
    return
  }

  const start = ta.selectionStart ?? 0
  const end = ta.selectionEnd ?? 0
  const value = ta.value || ''
  const selected = value.substring(start, end) || placeholder
  const newValue = value.substring(0, start) + prefix + selected + suffix + value.substring(end)
  model.value = newValue

  // set cursor/caret after update
  nextTick(() => {
    // position caret to surround the inserted content (select the inner content)
    const newStart = start + prefix.length
    const newEnd = newStart + selected.length
    ta.focus()
    ta.setSelectionRange(newStart, newEnd)
  })
}

function onBold() {
  replaceSelection('**', '**', '加粗文本')
}

function onItalic() {
  replaceSelection('*', '*', '斜体文本')
}

function onStrike() {
  replaceSelection('~~', '~~', '删除线文本')
}

function onLink() {
  const ta = getTextarea()
  // if there's a selection, use it as link text; else ask for link text
  let selectedText = ''
  if (ta) {
    const start = ta.selectionStart ?? 0
    const end = ta.selectionEnd ?? 0
    selectedText = (ta.value || '').substring(start, end)
  }
  else {
    selectedText = model.value || ''
  }

  const text = selectedText || window.prompt('Link text', '链接文本') || '链接文本'
  const url = window.prompt('URL', 'https://') || 'https://'
  // insert [text](url)
  // If there's a selected text, replace it; otherwise insert at cursor or append
  if (ta) {
    const start = ta.selectionStart ?? 0
    const end = ta.selectionEnd ?? 0
    const value = ta.value || ''
    const newValue = `${value.substring(0, start)}[${text}](${url})${value.substring(end)}`
    model.value = newValue
    nextTick(() => {
      const pos = start + (`[${text}](${url})`).length
      ta.focus()
      ta.setSelectionRange(pos, pos)
    })
  }
  else {
    // fallback
    model.value = `${model.value || ''}[${text}](${url})`
  }
}
</script>

<template>
  <div class="flex gap-2 w-full">
    <el-form-item label="文本内容" class="flex-1">
      <div class="flex flex-col gap-2 w-full">
        <el-button-group class="w-full">
          <el-button @click="onBold">
            <div class="i-icon-park-outline:text-bold" />
          </el-button>
          <el-button @click="onItalic">
            <div class="i-icon-park-outline:text-italic" />
          </el-button>
          <el-button @click="onStrike">
            <div class="i-icon-park-outline:strikethrough" />
          </el-button>
          <el-button @click="onLink">
            <div class="i-icon-park-outline:link" />
          </el-button>
        </el-button-group>
        <div class="flex gap-2 h-full" style="min-height: 200px">
          <el-input ref="inputRef" v-model="model" class="flex-1" type="textarea" :rows="10" resize="vertical" />
          <div style="height: 100%" class="border p-2 rounded bg-light h-full overflow-auto flex-1" v-html="htmlText" />
        </div>
      </div>
    </el-form-item>
  </div>
</template>

<style scoped>

</style>

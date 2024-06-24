import type {
  CompletionItemProvider,
  TextDocument,
} from 'vscode'

import {
  CompletionItem,
  CompletionItemKind,
  MarkdownString,
  SnippetString,
  window,
} from 'vscode'
import { isFn, toArray } from '../utils'
import type { SnippetBodyOption, VSCodeSchemasGlobalSnippets } from '../types'

interface SnippetConfig {
  snippet: VSCodeSchemasGlobalSnippets
  language?: string
}

type Arrayable<T> = T | Array<T>

export class RemoteCompletionItemProvider implements CompletionItemProvider {
  configs = new Map<string, SnippetConfig>()

  #languages = new Set<string>()

  get languages() {
    return Array.from(this.#languages)
  }

  add(id: string, snippet: VSCodeSchemasGlobalSnippets, language?: string) {
    this.configs.set(id, {
      snippet,
      language,
    })

    Object.values(snippet).forEach((item) => {
      this.#setLanguages(item.scope)
    })

    this.#setLanguages(language)
  }

  #setLanguages(languages?: string) {
    languages?.split(',').forEach((item) => {
      this.#languages.add(item.trim())
    })
  }

  clear() {
    this.#languages.clear()
    this.configs.clear()
  }

  provideCompletionItems(document: TextDocument): CompletionItem[] {
    const items: CompletionItem[] = []

    const docLang = document.languageId

    const pos = window.activeTextEditor?.selection.active
    const currentLineText = pos ? document.lineAt(pos).text : ''

    const snippetBodyOption: SnippetBodyOption = {
      file: document.fileName,
      text: currentLineText,
    }

    for (const conf of this.configs.values()) {
      const list: CompletionItem[] = []
      Object.entries(conf.snippet)
        .filter(([_name, w]) => {
          return conf.language
            ? conf.language.includes(docLang)
            : w.scope
              ? w.scope.includes(docLang)
              : true
        })
        .forEach(([title, snippet]) => {
          toArray(snippet.prefix).forEach((prefix) => {
            const label: string = prefix || ''
            if (!label)
              return

            const item = new CompletionItem(label, CompletionItemKind.Snippet)

            item.detail = title

            const codeBody = isFn(snippet.body)
              ? (snippet.body as ((opt: SnippetBodyOption) => Arrayable<string>))(snippetBodyOption)
              : snippet.body

            const code = toArray(codeBody).join('\n')

            item.insertText = new SnippetString(code)

            const documentation = [
              toArray(snippet.description).join('\n') || title,
              '',
              `\`\`\`${conf.language}`,
              code,
              '```',
            ].join('\n')

            item.documentation = new MarkdownString(documentation)
            list.push(item)
          })
        })

      items.push(...list)
    }

    return items
  }
}

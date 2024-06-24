import type { ValidateFunction } from 'ajv'
import Ajv from 'ajv'
import type { Disposable, ExtensionContext } from 'vscode'
import { languages, workspace } from 'vscode'
import type { VSCodeSchemasGlobalSnippets } from '../types'

import Config from '../config'

import { getGlobalSnippetSchema } from './get-snippet-schema'
import { RemoteCompletionItemProvider } from './remote-completion'

import { apiCache, fetchSnippets } from './fetch'

let validate: ValidateFunction

export async function isValidSnippet(snippet: Record<string, any>) {
  if (!validate) {
    const txt = await getGlobalSnippetSchema()
    const schema = JSON.parse(txt)

    schema.$id = schema.id
    delete schema.id

    const ajv = new Ajv({
      strict: false,
    })

    validate = ajv.compile(schema)
  }

  const isValid = validate(snippet)

  return isValid
}

export async function fetchSnippet(eventId: string): Promise<false | VSCodeSchemasGlobalSnippets> {
  try {
    const data = await fetchSnippets(eventId)

    if (!(await isValidSnippet(data)))
      return false

    return data
  }
  catch (error) {
    console.warn(error)
    return false
  }
}

export async function cacheRemoteSnippets(
  provider: RemoteCompletionItemProvider,
) {
  const remoteConfigs = Config.get().snippet.remoteConfigs ?? []

  for (const remoteConfig of remoteConfigs) {
    try {
      const snippetConfig = await fetchSnippet(remoteConfig.id)
      if (!snippetConfig)
        continue
      provider.add(remoteConfig.id, snippetConfig, remoteConfig.language)
    }
    catch (error) {
      console.error(error)
    }
  }
}

export function deactivateSnippet() {
  apiCache.saveSync()
}

export const provider = new RemoteCompletionItemProvider()

async function refreshSnippets() {
  try {
    await cacheRemoteSnippets(provider)
  }
  catch (error) {
    console.error(error)
  }
}

export function handleRefreshSnippetCommand() {
  apiCache.clear()
  provider.clear()
  refreshSnippets()
}

export async function activeSnippet(ctx: ExtensionContext) {
  await apiCache.load()
  await refreshSnippets()

  let unregister: Disposable | null = null
  updateCompletionProviderLanguages()

  function updateCompletionProviderLanguages() {
    unregister?.dispose()

    const supportedLang = provider.languages

    unregister = languages.registerCompletionItemProvider(
      supportedLang.map(n => ({
        language: n,
      })),
      provider,
    )
  }
  ctx.subscriptions.push({
    dispose: () => unregister?.dispose(),
  })

  ctx.subscriptions.push(
    workspace.onDidChangeConfiguration(async (e) => {
      if (!e.affectsConfiguration('remote-snippets'))
        return

      provider.clear()
      await refreshSnippets()
      updateCompletionProviderLanguages()
    }),
  )
}

/* IMPORT */

import path from 'node:path'
import { bindAll, last, sortBy } from 'lodash'
import findUp from 'find-up'
import { simpleGit } from 'simple-git'
import type { SimpleGit } from 'simple-git'
import vscode from 'vscode'
import Commands from './commands'
import Config from './config'

/* UTILS */

const Utils = {
  initCommands(context: vscode.ExtensionContext) {
    const { commands }: { commands: { command: string; title: string }[] }
      = vscode.extensions.getExtension('gadzanmai.lxec-frd-toolkid')
        ?.packageJSON.contributes

    commands.forEach(({ command }) => {
      const commandName = last(command.split('.')) ?? ''
      const handler = (Commands as any)[commandName]
      const disposable = vscode.commands.registerCommand(command, () =>
        handler(),
      )

      context.subscriptions.push(disposable)
    })

    return Commands
  },

  folder: {
    getRootPath(basePath?: string) {
      const { workspaceFolders } = vscode.workspace

      if (!workspaceFolders)
        return

      const firstRootPath = workspaceFolders[0].uri.fsPath

      if (!basePath || !path.isAbsolute(basePath))
        return firstRootPath

      const rootPaths = workspaceFolders.map(folder => folder.uri.fsPath)
      const sortedRootPaths = sortBy(rootPaths, [
        path => path.length,
      ]).reverse() // In order to get the closest root

      return sortedRootPaths.find(rootPath => basePath.startsWith(rootPath))
    },

    async getWrapperPathOf(_rootPath: string, cwdPath: string, findPath: string) {
      const foundPath = await findUp(findPath, { cwd: cwdPath })

      if (foundPath) {
        const wrapperPath = path.dirname(foundPath)

        return wrapperPath
      }
    },
  },

  repo: {
    getGit(repopath: string) {
      return bindAll(simpleGit(repopath), ['branch', 'getRemotes'])
    },

    async getHash(git: SimpleGit) {
      return (await git.revparse(['HEAD'])).trim()
    },

    async getPath() {
      const { activeTextEditor } = vscode.window
      const editorPath
        = activeTextEditor && activeTextEditor.document.uri.fsPath
      const rootPath = Utils.folder.getRootPath(editorPath)

      if (!rootPath)
        return false

      return await Utils.folder.getWrapperPathOf(
        rootPath,
        editorPath || rootPath,
        '.git',
      )
    },

    async getBranch(git: SimpleGit) {
      const config = Config.get()

      if (!config.useLocalBranch)
        return config.remote.branch

      const branches = await git.branch()

      return branches.current
    },

    async getUrl(git: SimpleGit) {
      const config = Config.get()
      const remotes = await git.getRemotes(true)
      const remotesGitlab = remotes.filter(remote =>
        (remote.refs.fetch || remote.refs.push).includes(config.gitlab.domain),
      )
      const remoteOrigin = remotesGitlab.filter(
        remote => remote.name === config.remote.name,
      )[0]
      const remote = remoteOrigin || remotesGitlab[0]

      if (!remote)
        return

      const ref = remote.refs.fetch || remote.refs.push
      // const re = /\.[^.:/]+[:/]([^/]+)\/(.*?)(?:\.git|\/)?$/
      const re = /[^.:/]+[:/]\d+\/([^/]+)\/(.*?)(?:\.git|\/)?$/
      const match = re.exec(ref)

      if (!match)
        return
      return `${config.gitlab.protocol}://${config.gitlab.domain}/${match[1]}/${match[2]}`
    },
  },
}

/* EXPORT */

export default Utils

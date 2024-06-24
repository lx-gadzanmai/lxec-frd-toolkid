/* IMPORT */

import { compact } from 'lodash'
import vscode from 'vscode'
import Config from '../config'
import Utils from '../utils'

async function getGit() {
  const repopath = await Utils.repo.getPath()

  if (!repopath) {
    vscode.window.showErrorMessage(
      '在能够在Gitlab中打开之前，您必须先打开一个git项目',
    )
    return {}
  }

  return {
    git: Utils.repo.getGit(repopath),
    repopath,
  }
}

/* URL */

const URL = {
  async get(file = false, permalink = false, page?: string) {
    const { git, repopath } = await getGit()
    if (!git)
      return
    const repourl = await Utils.repo.getUrl(git)

    if (!repourl)
      return vscode.window.showErrorMessage('未找到远程仓库')

    const config = Config.get()

    let filePath: string | undefined = ''
    let branch = ''
    let lines = ''
    let hash = ''

    if (file) {
      const { activeTextEditor } = vscode.window

      if (!activeTextEditor) {
        return vscode.window.showErrorMessage(
          '在能够在Gitlab中打开之前，您必须先打开一个文件',
        )
      }

      const editorPath = activeTextEditor.document.uri.fsPath

      filePath = editorPath
        ? editorPath.substring(repopath.length + 1).replace(/\\/g, '/')
        : undefined

      if (filePath) {
        branch = await Utils.repo.getBranch(git)

        if (config.useLocalRange) {
          const selections = activeTextEditor.selections

          if (selections.length === 1) {
            const selection = selections[0]

            if (!selection.isEmpty) {
              if (selection.start.line === selection.end.line) {
                lines = `#L${selection.start.line + 1}`
              }
              else {
                lines = `#L${selection.start.line + 1}-L${
                  selection.end.line + 1
                }`
              }
            }
            else if (config.useLocalLine) {
              lines = `#L${selection.start.line + 1}`
            }
          }
        }

        if (permalink) {
          branch = ''
          hash = await Utils.repo.getHash(git)
        }
      }
    }

    branch = encodeURIComponent(branch)
    filePath = encodeURIComponent(filePath ?? '').replace(/%2F/g, '/')

    const url = compact([repourl, page, branch, hash, filePath, lines]).join(
      '/',
    )

    return url
  },

  async copy(file = false, permalink = false, page?: string) {
    const url = await URL.get(file, permalink, page)

    await vscode.env.clipboard.writeText(url ?? '')

    vscode.window.showInformationMessage('链接已复制到剪贴板！')
  },

  async openWithBranch(page: string, pre?: string, next?: string) {
    const url = await URL.get(false, false, page)
    const { git } = await getGit()
    if (!git)
      return
    let branch = await Utils.repo.getBranch(git)
    branch = encodeURIComponent(branch)
    if (url) {
      const urlWithBranch = [url, pre, branch, next].filter(Boolean).join('/')
      vscode.env.openExternal(vscode.Uri.parse(urlWithBranch))
    }
  },
  async open(file = false, permalink = false, page?: string) {
    const url = await URL.get(file, permalink, page)
    url && vscode.env.openExternal(vscode.Uri.parse(url))
  },
}

/* EXPORT */

export default URL

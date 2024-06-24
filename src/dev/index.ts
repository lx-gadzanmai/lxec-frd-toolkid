import path from 'node:path'
import vscode from 'vscode'
import Utils from '../utils'

async function process() {
  const pagePath = await Utils.folder.getPath(['entry.js', 'entry.ts'])
  if (!pagePath) {
    vscode.window.showErrorMessage(
      '未找到 ares 页面入口文件',
    )
    return
  }

  const pathArr = pagePath.split(path.sep)
  const pagesIndex = pathArr.length > 1 ? pathArr.indexOf('pages') : -1
  if (pagesIndex > -1) {
    const pageArr = pathArr.slice(pagesIndex + 1)
    // 如果结尾的文件夹名是版本号，则去掉
    if (/^\d+(\.\d+){1,}$/.test(pageArr[pageArr.length - 1]))
      pageArr.pop()

    if (pageArr.length < 1) {
      vscode.window.showErrorMessage(
        '页面路径有误',
      )
      return
    }
    const pageCommand = pageArr.join('_')
    const terminal = vscode.window.createTerminal('Ares 开发服务')
    terminal.show(true)
    const aresCommand = `ares dev ${pageCommand}`
    terminal.sendText(aresCommand)
  }
}

export default {
  process,
}

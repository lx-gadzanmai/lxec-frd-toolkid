import type { ExtensionContext } from 'vscode'
import { StatusBarAlignment, window } from 'vscode'

import Utils from './utils'
import Config from './config'

import { checkAndUpdate } from './update'

export function activate(ctx: ExtensionContext) {
  Utils.initCommands(ctx)
  const config = Config.get()
  const statusBar = window.createStatusBarItem(StatusBarAlignment.Left, 0)
  statusBar.command = `lxEcFrdToolKid.${config.button.defaultCommand}`
  statusBar.text = '$(git-branch) Gitlab'
  statusBar.tooltip = '在 Gitlab 里打开该项目'
  statusBar.show()
  // 检查更新
  checkAndUpdate()
}

export function deactivate() {

}

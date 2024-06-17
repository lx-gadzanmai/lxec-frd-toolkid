import semver from 'semver'
import vscode from 'vscode'
import Package from '../package'
import { fetchLastVersion } from './version'

import { install } from './install'

async function shouldUpdate(data: { version: string; package_url: string }) {
  const displayName = Package.get().displayName
  const buttonLabel = await vscode.window.showInformationMessage(
    `插件[${displayName}], 是否更新该插件？`,
    '是',
    '否',
  )
  if (buttonLabel === '是')
    install(data)
}

export async function checkAndUpdate() {
  // 获取最新的版本号
  const data = await fetchLastVersion()

  // 获取本地安装的插件版本号
  const currentVersion = Package.get().version

  // 比较
  const needsUpdate = semver.gt(data.version ?? '0.0.1', currentVersion)

  if (needsUpdate)
    shouldUpdate(data)
}

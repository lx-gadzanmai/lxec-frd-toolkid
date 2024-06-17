import path from 'node:path'
import os from 'node:os'
import https from 'node:https'
import child_process from 'node:child_process'
import fs from 'fs-extra'
import vscode from 'vscode'

import Package from '../package'

const cacheDir = path.resolve(
  os.homedir(),
  os.platform() === 'darwin'
    ? '.update-vscode-extension'
    : 'cache-update-vscode-extension',
)
fs.ensureDirSync(cacheDir)

// 下载
export async function download(
  downloadDir: string,
  url: string,
): Promise<string | false> {
  return new Promise((resolve) => {
    // 创建文件夹
    if (!fs.existsSync(downloadDir))
      fs.mkdirSync(downloadDir)

    https
      .get(url, (res) => {
        const filePath = path.join(downloadDir, 'extension.vsix')
        const file = fs.createWriteStream(filePath)
        res.pipe(file)
        file.on('finish', () => {
          file.close()
          resolve(filePath)
        })
      })
      .on('error', () => {
        resolve(false)
      })
  })
}

async function afterUpdate() {
  const displayName = Package.get().displayName
  const buttonLabel = await vscode.window.showInformationMessage(
    `插件[${displayName}]自动更新完毕, 是否重启该窗口`,
    '是',
    '否',
  )
  if (buttonLabel === '是')
    vscode.commands.executeCommand('workbench.action.reloadWindow')
}

// 安装
async function processInstall(fileAddress: string): Promise<boolean> {
  return new Promise((resolve) => {
    let cmd = ''
    if (os.platform() === 'win32')
      cmd = path.join(vscode.env.appRoot, '../../bin', 'code.cmd')
    else cmd = path.join(vscode.env.appRoot, 'bin', 'code')

    child_process.execFile(
      cmd,
      ['--install-extension', fileAddress],
      {},
      (error, _stdout, _stderr) => {
        if (!error) {
          resolve(true)
          // 安装成功后，删除文件
          fs.unlinkSync(fileAddress)
          afterUpdate()
        }
        else {
          vscode.window.showErrorMessage(`插件自动更新失败: ${error}`)
          resolve(false)
        }
      },
    )
  })
}

export async function install(data: { version: string; package_url: string }) {
  const file = await download(cacheDir, data.package_url)
  file && processInstall(file)
}

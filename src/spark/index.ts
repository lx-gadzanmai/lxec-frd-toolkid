/* eslint-disable no-template-curly-in-string */
import { Hover, MarkdownString, languages, workspace } from 'vscode'
import type { CancellationToken, ExtensionContext, Position, TextDocument } from 'vscode'

const aliasToPackage: Record<string, string> = {
  'c~base': 'common',
  'c~upper': 'common',
  'v~base': 'vue-common',
  'v~upper': 'vue-common',
  'v~biz': 'vue-h5-biz',
  'v~ui': 'vue-h5-ui',
  'w~base': 'weex-common',
  'w~upper': 'weex-common',
  'w~biz': 'weex-biz',
  'w~ui': 'weex-ui',
}
const DOC = 'https://alpha.oa.fenqile.com/spark_door'
const files = ['vue', 'typescript', 'javascript']

const PACKAGE_REG = /(?<=@)([cvw]~\w+)/g
const COMPONENTS_REG = /([\w-]+)(?=\/(\d+\.\d+))/g
const VERSION_REG = /(?<=[\w-]+\/)(\d+\.\d+)/g

export function provideHover(document: TextDocument, position: Position, _token: CancellationToken) {
  const line = document.lineAt(position)
  const packageLink = line.text.match(PACKAGE_REG) ?? ['']
  const componentLink = line.text.match(COMPONENTS_REG) ?? ['']
  const versionLink = line.text.match(VERSION_REG) ?? ['']

  // spark 门户对应组件 url
  if (packageLink.length && componentLink.length && versionLink.length) {
    const pkg = aliasToPackage[packageLink[0]]
    const component = `${componentLink[0]}_${versionLink[0].replace('.', '')}`

    const text = new MarkdownString(
    `[Spark Door -> $(references) 请查看 ${componentLink}_${versionLink} 组件文档](${DOC}/${pkg}/${component})\n`,
    true,
    )
    return new Hover(text)
  }
}

// 别名跳转
export function initAliasSkipConfig() {
  workspace.getConfiguration().update('alias-skip.allowedsuffix', ['js', 'vue', 'jsx', 'ts'], true)
  workspace.getConfiguration().update('alias-skip.rootpath', 'package.json', true)
  workspace.getConfiguration().update('alias-skip.mappings', {
    '@c~base': '/node_modules/@spark/common/base',
    '@c~upper': '/node_modules/@spark/common/upper/module',
    '@v~biz': '/node_modules/@spark/vue-h5-biz',
    '@v~upper': '/node_modules/@spark/vue-common/upper',
    '@v~base': '/node_modules/@spark/vue-common/base',
    '@v~ui': '/node_modules/@spark/vue-h5-ui',
    '@w~biz': '/node_modules/@spark/weex-biz',
    '@w~upper': '/node_modules/@spark/weex-common/upper',
    '@w~base': '/node_modules/@spark/weex-common/base',
    '@w~ui': '/node_modules/@spark/weex-ui',
  }, true)
}

// 路径补全
export function initPathIntellisenseConfig() {
  // 自动补全文件扩展名
  workspace.getConfiguration().update('path-intellisense.extensionOnImport', true, true)
  // 工程路径映射，路径补全使用
  const defaultMappings = {
    '@c~upper': '${workspaceFolder}/node_modules/@spark/common/upper',
    '@c~base': '${workspaceFolder}/node_modules/@spark/common/base',
    '@v~biz': '${workspaceFolder}/node_modules/@spark/vue-h5-biz',
    '@v~upper': '${workspaceFolder}/node_modules/@spark/vue-common/upper',
    '@v~base': '${workspaceFolder}/node_modules/@spark/vue-common/base',
    '@v~ui': '${workspaceFolder}/node_modules/@spark/vue-h5-ui',
    '@w~biz': '${workspaceFolder}/node_modules/@spark/weex-biz',
    '@w~upper': '${workspaceFolder}/node_modules/@spark/weex-common/upper',
    '@w~base': '${workspaceFolder}/node_modules/@spark/weex-common/base',
    '@w~ui': '${workspaceFolder}/node_modules/@spark/weex-ui',
  }
  const pathIntellisenseMappings: any = workspace.getConfiguration().get('path-intellisense.mappings')
  const _mappings = pathIntellisenseMappings ? { ...pathIntellisenseMappings, ...defaultMappings } : defaultMappings
  workspace.getConfiguration().update('path-intellisense.mappings', _mappings, true)
}

export function activeSparkIntellisense(context: ExtensionContext) {
  // 初始化全局写入依赖插件配置
  initAliasSkipConfig()
  initPathIntellisenseConfig()

  context.subscriptions.push(
    // 悬浮提示跳转
    languages.registerHoverProvider(files, {
      provideHover,
    }),
  )
}

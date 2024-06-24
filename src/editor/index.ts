import vscode from 'vscode'
import Config from '../config'

function insertText(val: string, cursorMove: boolean, textLen: number) {
  const { activeTextEditor } = vscode.window

  if (!activeTextEditor)
    return

  const selection = activeTextEditor.selection

  const range = new vscode.Range(selection.start, selection.end)

  activeTextEditor
    .edit((editBuilder) => {
      editBuilder.replace(range, val)
    })
    .then(() => {
      const position = activeTextEditor.selection.end
      if (cursorMove) {
        // vscode.commands.executeCommand('cursorMove', { to: 'left', by: 'character', value: 1, select: false }).then(() => {
        //   vscode.commands.executeCommand('cursorMove', { to: 'left', by: 'character', value: 3, select: true })
        // })
        const positionStart1 = new vscode.Position(
          position.line,
          position.character - textLen,
        )
        const positionStart2 = new vscode.Position(
          position.line,
          position.character - textLen + 3,
        )
        const positionEnd1 = new vscode.Position(
          position.line,
          position.character - 5,
        )
        const positionEnd2 = new vscode.Position(
          position.line,
          position.character - 2,
        )
        const selectionStart = new vscode.Selection(
          positionStart1,
          positionStart2,
        )
        const selectionEnd = new vscode.Selection(positionEnd1, positionEnd2)

        activeTextEditor.selections = [selectionStart, selectionEnd]
      }
      else {
        activeTextEditor.selection = new vscode.Selection(position, position)
      }
    })
}

function getAllLogs(document: any, documentText: string) {
  const logStatements = []
  const config = Config.get()
  let logRegex = /console.log\('%c(.*color.*background.*)\);?/g
  if (config?.log?.deleteAll)
    logRegex = /console.log\('%c(.*)\);?/g

  let match
  // eslint-disable-next-line no-cond-assign
  while ((match = logRegex.exec(documentText))) {
    const matchRange = new vscode.Range(
      document.positionAt(match.index),
      document.positionAt(match.index + match[0].length),
    )
    if (!matchRange.isEmpty)
      logStatements.push(matchRange)
  }
  return logStatements
}

function deleteFoundLogs(workspaceEdit: any, docUri: any, logs: any) {
  logs.forEach((log: any) => {
    workspaceEdit.delete(docUri, log)
  })

  vscode.workspace.applyEdit(workspaceEdit).then(() => {
    vscode.window.showInformationMessage(`${logs.length} console.log deleted`)
  })
}

function bgc() {
  const colors = [
    'rgb(205, 179, 128)',
    'rgb(3, 101, 100)',
    'rgb(3, 22, 52)',
    'rgb(237, 222, 139)',
    'rgb(251, 178, 23)',
    'rgb(96, 143, 159)',
    'rgb(1, 77, 103)',
    'rgb(254, 67, 101)',
    'rgb(252, 157, 154)',
    'rgb(131, 175, 155)',
    'rgb(229, 187, 129)',
    'rgb(161, 23, 21)',
    'rgb(34, 8, 7)',
    'rgb(118, 77, 57)',
    'rgb(17, 63, 61)',
    'rgb(60, 79, 57)',
    'rgb(95, 92, 51)',
    'rgb(179, 214, 110)',
    'rgb(248, 214, 110)',
    'rgb(248, 147, 29)',
    'rgb(227, 160, 93)',
    'rgb(178, 190, 126)',
    'rgb(56, 13, 49)',
    'rgb(89, 61, 67)',
    'rgb(3, 38, 58)',
    'rgb(222, 125, 44)',
    'rgb(20, 68, 106)',
    'rgb(130, 57, 53)',
    'rgb(23, 44, 60)',
    'rgb(39, 72, 98)',
    'rgb(153, 80, 84)',
    'rgb(217, 104, 49)',
    'rgb(38, 157, 128)',
    'rgb(114, 83, 52)',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

export default {
  insertLog() {
    const { activeTextEditor } = vscode.window

    if (!activeTextEditor) {
      return vscode.window.showErrorMessage(
        '在能够操作之前，您必须先打开一个文件',
      )
    }
    const selection = activeTextEditor.selection
    const text = activeTextEditor.document.getText(selection)
    const lineNumber = selection.active.line + 1
    const config = Config.get()
    const bgcolor = bgc()
    const outer = 'padding:3px;border-radius:2px'
    const fontCol = 'color:#fff'

    let projectName = 'MyProject'
    let showLine = false
    let logToInsert = ''
    let noTextStr = ''
    let line = ''

    if (config.log) {
      projectName = config.log.projectName || projectName
      showLine = config.log.showLine || showLine
      line = showLine ? `%cline:${lineNumber}` : '%c'
    }
    if (text) {
      const str = `${text}`.replace(/'|"/g, '')
      logToInsert = `console.log('%c${projectName}${line}%c${str}', '${fontCol};background:#ee6f57;${outer}', '${fontCol};background:#1f3c88;${outer}', '${fontCol};background:${bgcolor};${outer}', ${text});`
    }
    else {
      noTextStr = `var', '${fontCol};background:#ee6f57;${outer}', '${fontCol};background:#1f3c88;${outer}', '${fontCol};background:${bgcolor};${outer}', 'var');`
      logToInsert = `console.log('%c${projectName}${line}%c${noTextStr}`
    }
    vscode.commands.executeCommand('editor.action.insertLineAfter').then(() => {
      insertText(logToInsert, !text, noTextStr.length)
    })
  },
  deleteLogs() {
    const { activeTextEditor } = vscode.window

    if (!activeTextEditor) {
      return vscode.window.showErrorMessage(
        '在能够操作之前，您必须先打开一个文件',
      )
    }
    const document = activeTextEditor.document
    const documentText = activeTextEditor.document.getText()

    const workspaceEdit = new vscode.WorkspaceEdit()

    const logStatements = getAllLogs(document, documentText)

    deleteFoundLogs(workspaceEdit, document.uri, logStatements)
  },
}

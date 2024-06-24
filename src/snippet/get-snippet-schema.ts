import { Uri, workspace } from 'vscode'

/**
 * https://github.com/wraith13/vscode-schemas
 *
 * https://github.com/wraith13/save-vscode-schemas
 */
export async function getGlobalSnippetSchema() {
  const schema = (
    await workspace.openTextDocument(
      Uri.parse('vscode://schemas/global-snippets'),
    )
  ).getText()

  return schema
}

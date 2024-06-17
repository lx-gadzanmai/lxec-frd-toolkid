/* IMPORT */

import * as vscode from 'vscode'

/* CONFIG */

const Package = {
  get() {
    return vscode.extensions.getExtension('gadzanmai.lxec-frd-toolkid')?.packageJSON
  },
}

/* EXPORT */

export default Package

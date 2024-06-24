/* IMPORT */

import URL from './gitlab/url'
import Editor from './editor/index'
import { handleRefreshSnippetCommand } from './snippet'

/* COMMANDS */

function openProject() {
  return URL.open()
}

function openIssues() {
  return URL.open(false, false, 'issues')
}

function openMergeRequests() {
  return URL.open(false, false, 'merge_requests')
}

function openBranches() {
  return URL.open(false, false, 'branches')
}

function openWiki() {
  return URL.open(false, false, 'wiki')
}

function openRepository() {
  return URL.openWithBranch('tree')
}

function openCommits() {
  return URL.openWithBranch('commits')
}

function openNetwork() {
  return URL.openWithBranch('network')
}

function openReleases() {
  return URL.open(false, false, 'releases')
}

function openTags() {
  return URL.open(false, false, 'tags')
}

function openActivity() {
  return URL.open(false, false, 'activity')
}

function openFile() {
  return URL.open(true, false, 'blob')
}

function openFileHistory() {
  return URL.open(true, false, 'commits')
}

function openFileBlame() {
  return URL.open(true, false, 'blame')
}

function openFilePermalink() {
  return URL.open(true, true, 'blob')
}

function copyFilePermalink() {
  return URL.copy(true, true, 'blob')
}

function insertLog() {
  return Editor.insertLog()
}

function deleteLogs() {
  return Editor.deleteLogs()
}

function snippetsRefresh() {
  return handleRefreshSnippetCommand()
}

/* EXPORT */

export default {
  openProject,
  openIssues,
  openMergeRequests,
  openBranches,
  openWiki,
  openRepository,
  openReleases,
  openFile,
  openCommits,
  openNetwork,
  openTags,
  openActivity,
  openFileHistory,
  openFileBlame,
  openFilePermalink,
  copyFilePermalink,
  insertLog,
  deleteLogs,
  snippetsRefresh,
}

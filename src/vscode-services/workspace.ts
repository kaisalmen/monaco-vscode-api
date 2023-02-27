import type * as vscode from 'vscode'
import { Event } from 'vs/base/common/event'
import { URI } from 'vs/base/common/uri'
import { DEFAULT_EXTENSION, getExtHostServices } from './extHost'
import { unsupported } from '../tools'
import { Services } from '../services'

class EmptyFileSystem implements vscode.FileSystem {
  isWritableFileSystem (): boolean | undefined {
    return false
  }

  stat = unsupported
  readDirectory (): Thenable<[string, vscode.FileType][]> {
    return Promise.resolve([])
  }

  createDirectory (): Thenable<void> {
    return Promise.resolve()
  }

  readFile (): Thenable<Uint8Array> {
    return Promise.resolve(new Uint8Array(0))
  }

  writeFile (): Thenable<void> {
    return Promise.resolve()
  }

  delete (): Thenable<void> {
    return Promise.resolve()
  }

  rename (): Thenable<void> {
    return Promise.resolve()
  }

  copy (): Thenable<void> {
    return Promise.resolve()
  }
}

const workspace: typeof vscode.workspace = {
  fs: new EmptyFileSystem(),
  workspaceFile: undefined,
  createFileSystemWatcher (globPattern, ignoreCreateEvents, ignoreChangeEvents, ignoreDeleteEvents): vscode.FileSystemWatcher {
    const { workspace } = Services.get()
    if (workspace?.createFileSystemWatcher != null) {
      return workspace.createFileSystemWatcher(globPattern, ignoreCreateEvents, ignoreChangeEvents, ignoreDeleteEvents)
    }
    return {
      ignoreCreateEvents: ignoreCreateEvents ?? false,
      ignoreChangeEvents: ignoreChangeEvents ?? false,
      ignoreDeleteEvents: ignoreDeleteEvents ?? false,
      onDidCreate: Event.None,
      onDidChange: Event.None,
      onDidDelete: Event.None,
      dispose: () => { }
    }
  },
  applyEdit: async (edit: vscode.WorkspaceEdit) => {
    const { extHostBulkEdits } = getExtHostServices()
    const extension = Services.get().extension ?? DEFAULT_EXTENSION

    return extHostBulkEdits.applyWorkspaceEdit(edit, extension)
  },
  getConfiguration: (section, scope) => {
    const { extHostConfiguration } = getExtHostServices()

    const configProvider = extHostConfiguration.getConfigProvider()
    return configProvider.getConfiguration(section, scope, Services.get().extension ?? DEFAULT_EXTENSION)
  },
  onDidChangeConfiguration (listener, thisArgs, disposables) {
    const { extHostConfiguration } = getExtHostServices()

    const configProvider = extHostConfiguration.getConfigProvider()
    return configProvider.onDidChangeConfiguration(listener, thisArgs, disposables)
  },
  get rootPath () {
    const { extHostWorkspace } = getExtHostServices()

    return extHostWorkspace.getPath()
  },
  get workspaceFolders (): typeof vscode.workspace.workspaceFolders {
    const { extHostWorkspace } = getExtHostServices()

    return extHostWorkspace.getWorkspaceFolders()
  },
  getWorkspaceFolder (resource: vscode.Uri) {
    const { extHostWorkspace } = getExtHostServices()

    return extHostWorkspace.getWorkspaceFolder(resource)
  },
  onDidChangeWorkspaceFolders: function (listener, thisArgs?, disposables?) {
    const { extHostWorkspace } = getExtHostServices()

    return extHostWorkspace.onDidChangeWorkspace(listener, thisArgs, disposables)
  },
  get textDocuments (): typeof vscode.workspace.textDocuments {
    const { extHostDocuments } = getExtHostServices()
    return Array.from(extHostDocuments.getAllDocumentData().map(data => data.document))
  },
  get onDidOpenTextDocument (): typeof vscode.workspace.onDidOpenTextDocument {
    const { extHostDocuments } = getExtHostServices()
    return extHostDocuments.onDidAddDocument
  },
  get onDidCloseTextDocument (): typeof vscode.workspace.onDidCloseTextDocument {
    const { extHostDocuments } = getExtHostServices()
    return extHostDocuments.onDidRemoveDocument
  },
  get onDidChangeTextDocument (): typeof vscode.workspace.onDidChangeTextDocument {
    const { extHostDocuments } = getExtHostServices()
    return extHostDocuments.onDidChangeDocument
  },
  get onWillSaveTextDocument (): typeof vscode.workspace.onWillSaveTextDocument {
    const { workspace } = Services.get()
    return workspace?.onWillSaveTextDocument ?? Event.None
  },
  get onDidSaveTextDocument (): typeof vscode.workspace.onDidSaveTextDocument {
    const { workspace } = Services.get()
    return workspace?.onDidSaveTextDocument ?? Event.None
  },
  get onWillCreateFiles (): vscode.Event<vscode.FileWillCreateEvent> {
    return Event.None
  },
  get onDidCreateFiles (): vscode.Event<vscode.FileCreateEvent> {
    return Event.None
  },
  get onWillDeleteFiles (): vscode.Event<vscode.FileWillDeleteEvent> {
    return Event.None
  },
  get onDidDeleteFiles (): vscode.Event<vscode.FileDeleteEvent> {
    return Event.None
  },
  get onWillRenameFiles (): vscode.Event<vscode.FileWillRenameEvent> {
    return Event.None
  },
  get onDidRenameFiles (): vscode.Event<vscode.FileRenameEvent> {
    return Event.None
  },
  get onDidGrantWorkspaceTrust (): vscode.Event<void> {
    return Event.None
  },
  asRelativePath: (pathOrUri, includeWorkspace?) => {
    const { extHostWorkspace } = getExtHostServices()
    return extHostWorkspace.getRelativePath(pathOrUri, includeWorkspace)
  },
  updateWorkspaceFolders: (index, deleteCount, ...workspaceFoldersToAdd) => {
    const { extHostWorkspace } = getExtHostServices()
    const extension = Services.get().extension ?? DEFAULT_EXTENSION
    return extHostWorkspace.updateWorkspaceFolders(extension, index, deleteCount ?? 0, ...workspaceFoldersToAdd)
  },
  findFiles: (include, exclude, maxResults?, token?) => {
    const { extHostWorkspace } = getExtHostServices()
    const extension = Services.get().extension ?? DEFAULT_EXTENSION
    return extHostWorkspace.findFiles(include, exclude, maxResults, extension.identifier, token)
  },
  saveAll: (includeUntitled?) => {
    const { extHostWorkspace } = getExtHostServices()
    return extHostWorkspace.saveAll(includeUntitled)
  },
  openTextDocument (uriOrFileNameOrOptions?: vscode.Uri | string | { language?: string, content?: string }) {
    const { extHostDocuments } = getExtHostServices()
    let uriPromise: Thenable<URI>

    const options = uriOrFileNameOrOptions as { language?: string, content?: string }
    if (typeof uriOrFileNameOrOptions === 'string') {
      uriPromise = Promise.resolve(URI.file(uriOrFileNameOrOptions))
    } else if (URI.isUri(uriOrFileNameOrOptions)) {
      uriPromise = Promise.resolve(uriOrFileNameOrOptions)
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    } else if (options == null || typeof options === 'object') {
      uriPromise = extHostDocuments.createDocumentData(options)
    } else {
      throw new Error('illegal argument - uriOrFileNameOrOptions')
    }

    return uriPromise.then(uri => {
      return extHostDocuments.ensureDocumentData(uri).then(documentData => {
        return documentData.document
      })
    })
  },
  registerTextDocumentContentProvider (scheme: string, provider: vscode.TextDocumentContentProvider) {
    const { extHostDocumentContentProviders } = getExtHostServices()
    return extHostDocumentContentProviders.registerTextDocumentContentProvider(scheme, provider)
  },
  registerTaskProvider: unsupported,
  registerFileSystemProvider: unsupported,
  openNotebookDocument: unsupported,
  registerNotebookSerializer: unsupported,
  notebookDocuments: [],
  onDidOpenNotebookDocument: unsupported,
  onDidCloseNotebookDocument: unsupported,
  isTrusted: true,
  name: undefined,
  onDidChangeNotebookDocument: unsupported,
  onDidSaveNotebookDocument: unsupported
}

export default workspace

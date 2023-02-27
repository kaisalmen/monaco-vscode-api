import { Event } from 'vs/base/common/event'
import { DomEmitter } from 'vs/base/browser/event'
import { URI } from 'vs/base/common/uri'
import { trackFocus } from 'vs/base/browser/dom'
import { IProgress, IProgressCompositeOptions, IProgressDialogOptions, IProgressNotificationOptions, IProgressOptions, IProgressService, IProgressStep, IProgressWindowOptions } from 'vs/platform/progress/common/progress'
import { IEditorService } from 'vs/workbench/services/editor/common/editorService'
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite'
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity'
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles'
import { IFileService } from 'vs/platform/files/common/files'
import { GroupOrientation, IEditorGroup, IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService'
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService'
import { IWorkingCopyFileService } from 'vs/workbench/services/workingCopy/common/workingCopyFileService'
import { IPathService } from 'vs/workbench/services/path/common/pathService'
import { registerSingleton } from 'vs/platform/instantiation/common/extensions'
import { IProductService } from 'vs/platform/product/common/productService'
import { ILanguageStatus, ILanguageStatusService } from 'vs/workbench/services/languageStatus/common/languageStatusService'
import { ITextModel } from 'vs/editor/common/model'
import { IDisposable } from 'vs/workbench/workbench.web.main'
import { LanguageFeatureRegistry } from 'vs/editor/common/languageFeatureRegistry'
import { compare } from 'vs/base/common/strings'
import { IHostService } from 'vs/workbench/services/host/browser/host'
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle'
import { ILanguageDetectionService } from 'vs/workbench/services/languageDetection/common/languageDetectionWorkerService'
import { IExtensionService, NullExtensionService } from 'vs/workbench/services/extensions/common/extensions'
import { IKeyboardLayoutService } from 'vs/platform/keyboardLayout/common/keyboardLayout'
import { MacLinuxFallbackKeyboardMapper } from 'vs/workbench/services/keybinding/common/macLinuxFallbackKeyboardMapper'
import { OS } from 'vs/base/common/platform'
import { IEnvironmentService } from 'vs/platform/environment/common/environment'
import { IUserDataInitializationService } from 'vs/workbench/services/userData/browser/userDataInit'
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService'
import { BrowserHostColorSchemeService } from 'vs/workbench/services/themes/browser/browserHostColorSchemeService'
import { IHostColorSchemeService } from 'vs/workbench/services/themes/common/hostColorSchemeService'
import { IPreferencesService } from 'vs/workbench/services/preferences/common/preferences'
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey'
import { StandaloneServices } from 'vs/editor/standalone/browser/standaloneServices'
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService'
import { ITextMateService } from 'vs/workbench/services/textMate/browser/textMate'
import { IUserDataProfile, IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile'
import { IPolicyService } from 'vs/platform/policy/common/policy'
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile'
import { UserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfileService'
import { ISnippetsService } from 'vs/workbench/contrib/snippets/browser/snippets'
import { ISearchService } from 'vs/workbench/services/search/common/search'
import { IWorkspaceEditingService } from 'vs/workbench/services/workspaces/common/workspaceEditing'
import { IRequestService } from 'vs/platform/request/common/request'
import { RequestService } from 'vs/platform/request/browser/requestService'
import { IWorkspaceTrustRequestService } from 'vs/platform/workspace/common/workspaceTrust'
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService'
import { ISocketFactory } from 'vs/platform/remote/common/remoteAgentConnection'
import { BrowserPathService } from 'vs/workbench/services/path/browser/pathService'
import { IWorkingCopyBackupService } from 'vs/workbench/services/workingCopy/common/workingCopyBackup'
import { IWorkingCopyService, WorkingCopyService } from 'vs/workbench/services/workingCopy/common/workingCopyService'
import { FilesConfigurationService, IFilesConfigurationService } from 'vs/workbench/services/filesConfiguration/common/filesConfigurationService'
import { InMemoryWorkingCopyBackupService } from 'vs/workbench/services/workingCopy/common/workingCopyBackupService'
import { BrowserTextFileService } from 'vs/workbench/services/textfile/browser/browserTextFileService'
import { BrowserLifecycleService } from 'vs/workbench/services/lifecycle/browser/lifecycleService'
import { IDecorationsService } from 'vs/workbench/services/decorations/common/decorations'
import { DecorationsService } from 'vs/workbench/services/decorations/browser/decorationsService'
import { IElevatedFileService } from 'vs/workbench/services/files/common/elevatedFileService'
import { BrowserElevatedFileService } from 'vs/workbench/services/files/browser/elevatedFileService'
import { IFileDialogService } from 'vs/platform/dialogs/common/dialogs'
import { IUntitledTextEditorService } from 'vs/workbench/services/untitled/common/untitledTextEditorService'
import { UriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentityService'
import { Services } from '../services'
import { unsupported } from '../tools'

registerSingleton(IEditorService, class EditorService implements IEditorService {
  readonly _serviceBrand = undefined

  onDidActiveEditorChange = Event.None
  onDidVisibleEditorsChange = Event.None
  onDidEditorsChange = Event.None
  onDidCloseEditor = Event.None
  activeEditorPane = undefined
  activeEditor = undefined
  get activeTextEditorControl () { return StandaloneServices.get(ICodeEditorService).getFocusedCodeEditor() ?? undefined }
  activeTextEditorLanguageId = undefined
  visibleEditorPanes = []
  visibleEditors = []
  visibleTextEditorControls = []
  editors = []
  count = 0
  getEditors = () => []
  openEditor = unsupported
  openEditors = unsupported
  replaceEditors = async () => {}
  isOpened = () => false
  isVisible = () => false
  closeEditor = async () => {}
  closeEditors = async () => {}
  findEditors = () => []
  save = async () => false
  saveAll = async () => false
  revert = async () => false
  revertAll = async () => false
})

registerSingleton(IPaneCompositePartService, class PaneCompositePartService implements IPaneCompositePartService {
  readonly _serviceBrand = undefined
  onDidPaneCompositeOpen = Event.None
  onDidPaneCompositeClose = Event.None
  openPaneComposite = unsupported
  getActivePaneComposite = () => undefined
  getPaneComposite = () => undefined
  getPaneComposites = () => []
  getPinnedPaneCompositeIds = () => []
  getVisiblePaneCompositeIds = () => []
  getProgressIndicator = () => undefined
  hideActivePaneComposite = () => {}
  getLastActivePaneCompositeId = unsupported
  showActivity = unsupported
})

registerSingleton(IUriIdentityService, UriIdentityService, true)

registerSingleton(ITextFileService, BrowserTextFileService)

registerSingleton(IFileService, class FileService implements IFileService {
  readonly _serviceBrand = undefined
  onDidChangeFileSystemProviderRegistrations = Event.None
  onDidChangeFileSystemProviderCapabilities = Event.None
  onWillActivateFileSystemProvider = Event.None
  registerProvider = unsupported
  getProvider = function () {
    return undefined
  }

  activateProvider = async () => {}
  canHandleResource = async () => false
  hasProvider = () => false
  hasCapability = () => false
  listCapabilities = () => []
  onDidFilesChange = Event.None
  onDidRunOperation = Event.None
  resolve = unsupported
  resolveAll = unsupported
  stat = unsupported
  exists = async () => false
  readFile = unsupported
  readFileStream = unsupported
  writeFile = unsupported
  move = unsupported
  canMove = unsupported
  copy = unsupported
  canCopy = unsupported
  cloneFile = unsupported
  createFile = unsupported
  canCreateFile = unsupported
  createFolder = unsupported
  del = unsupported
  canDelete = unsupported
  onDidWatchError = Event.None
  watch = unsupported
  dispose () {
    // ignore
  }
})

class EmptyEditorGroup implements IEditorGroup {
  onDidModelChange = Event.None
  onWillDispose = Event.None
  onDidActiveEditorChange = Event.None
  onWillCloseEditor = Event.None
  onDidCloseEditor = Event.None
  onWillMoveEditor = Event.None
  onWillOpenEditor = Event.None
  id = 0
  index = 0
  label = 'main'
  ariaLabel = 'main'
  activeEditorPane = undefined
  activeEditor = null
  previewEditor = null
  count = 0
  isEmpty = false
  isLocked = false
  stickyCount = 0
  editors = []
  get scopedContextKeyService () { return StandaloneServices.get(IContextKeyService) }
  getEditors = unsupported
  findEditors = unsupported
  getEditorByIndex = unsupported
  getIndexOfEditor = unsupported
  openEditor = unsupported
  openEditors = unsupported
  isPinned = unsupported
  isSticky = unsupported
  isActive = unsupported
  contains = unsupported
  moveEditor = unsupported
  moveEditors = unsupported
  copyEditor = unsupported
  copyEditors = unsupported
  closeEditor = unsupported
  closeEditors = unsupported
  closeAllEditors = unsupported
  replaceEditors = unsupported
  pinEditor = unsupported
  stickEditor = unsupported
  unstickEditor = unsupported
  lock = unsupported
  focus (): void {
    // ignore
  }

  isFirst = () => true
  isLast = () => true
}

registerSingleton(IEditorGroupsService, class EditorGroupsService implements IEditorGroupsService {
  readonly _serviceBrand = undefined
  onDidChangeActiveGroup = Event.None
  onDidAddGroup = Event.None
  onDidRemoveGroup = Event.None
  onDidMoveGroup = Event.None
  onDidActivateGroup = Event.None
  onDidLayout = Event.None
  onDidScroll = Event.None
  onDidChangeGroupIndex = Event.None
  onDidChangeGroupLocked = Event.None
  get contentDimension () { return unsupported() }
  activeGroup = new EmptyEditorGroup()
  get sideGroup () { return unsupported() }
  groups = []
  count = 0
  orientation = GroupOrientation.HORIZONTAL
  isReady = false
  whenReady = Promise.resolve()
  whenRestored = Promise.resolve()
  hasRestorableState = false
  getGroups = () => []
  getGroup = () => undefined
  activateGroup = unsupported
  getSize = unsupported
  setSize = unsupported
  arrangeGroups = unsupported
  applyLayout = unsupported
  centerLayout = unsupported
  isLayoutCentered = () => false
  setGroupOrientation = unsupported
  findGroup = () => undefined
  addGroup = unsupported
  removeGroup = unsupported
  moveGroup = unsupported
  mergeGroup = unsupported
  mergeAllGroups = unsupported
  copyGroup = unsupported
  get partOptions () { return unsupported() }
  onDidChangeEditorPartOptions = Event.None
  enforcePartOptions = unsupported
})

class WorkbenchEnvironmentService implements IBrowserWorkbenchEnvironmentService {
  readonly _serviceBrand = undefined
  get logFile () { return unsupported() }
  get extHostLogsPath () { return unsupported() }
  skipReleaseNotes = true
  skipWelcome = true
  disableWorkspaceTrust = true
  get webviewExternalEndpoint () { return unsupported() }
  debugRenderer = false
  userRoamingDataHome = URI.from({ scheme: 'user', path: '/userRoamingDataHome' })
  keyboardLayoutResource = URI.from({ scheme: 'user', path: '/keyboardLayout.json' })
  get argvResource () { return unsupported() }
  snippetsHome = URI.from({ scheme: 'user', path: '/snippets' })
  untitledWorkspacesHome = URI.from({ scheme: 'user', path: '/untitledWorkspacesHome' })
  get globalStorageHome () { return unsupported() }
  get workspaceStorageHome () { return unsupported() }
  get localHistoryHome () { return unsupported() }
  cacheHome = URI.from({ scheme: 'cache', path: '/' })
  get userDataSyncHome () { return unsupported() }
  get userDataSyncLogResource () { return unsupported() }
  sync = undefined
  get debugExtensionHost () { return unsupported() }
  isExtensionDevelopment = false
  disableExtensions = false
  logsPath = ''
  verbose = false
  isBuilt = true // Required to suppress warnings
  disableTelemetry = false
  get telemetryLogResource () { return unsupported() }
  get serviceMachineIdResource () { return unsupported() }
  get stateResource () { return unsupported() }
  get editSessionsLogResource () { return unsupported() }
}
registerSingleton(IWorkbenchEnvironmentService, WorkbenchEnvironmentService)
registerSingleton(IEnvironmentService, WorkbenchEnvironmentService)
registerSingleton(IBrowserWorkbenchEnvironmentService, WorkbenchEnvironmentService)

registerSingleton(IWorkingCopyFileService, class WorkingCopyFileService implements IWorkingCopyFileService {
  readonly _serviceBrand = undefined
  onWillRunWorkingCopyFileOperation = Event.None
  onDidFailWorkingCopyFileOperation = Event.None
  onDidRunWorkingCopyFileOperation = Event.None
  addFileOperationParticipant = unsupported
  hasSaveParticipants = false
  addSaveParticipant = unsupported
  runSaveParticipants = unsupported
  create = unsupported
  createFolder = unsupported
  move = unsupported
  copy = unsupported
  delete = unsupported
  registerWorkingCopyProvider = unsupported
  getDirty = unsupported
}, true)

registerSingleton(IPathService, BrowserPathService, true)

registerSingleton(IProgressService, class ProgressService implements IProgressService {
  readonly _serviceBrand = undefined
  withProgress<R> (options: IProgressOptions | IProgressDialogOptions | IProgressNotificationOptions | IProgressWindowOptions | IProgressCompositeOptions, task: (progress: IProgress<IProgressStep>) => Promise<R>, onDidCancel?: ((choice?: number | undefined) => void) | undefined): Promise<R> {
    const { window } = Services.get()
    if (window?.withProgress != null) {
      return window.withProgress(options, task, onDidCancel)
    }
    return task({ report: () => { } })
  }
}, true)

registerSingleton(IProductService, class ProductService implements IProductService {
  readonly _serviceBrand = undefined

  version = VSCODE_VERSION
  nameShort = 'Code - OSS Dev'
  nameLong = 'Code - OSS Dev'
  applicationName = 'code-oss'
  dataFolderName = '.vscode-oss'
  urlProtocol = 'code-oss'
  reportIssueUrl = 'https://github.com/microsoft/vscode/issues/new'
  licenseName = 'MIT'
  licenseUrl = 'https://github.com/microsoft/vscode/blob/main/LICENSE.txt'
  serverApplicationName = 'code-server-oss'
})

registerSingleton(ILanguageStatusService, class LanguageStatusServiceImpl implements ILanguageStatusService {
  declare _serviceBrand: undefined

  private readonly _provider = new LanguageFeatureRegistry<ILanguageStatus>()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly onDidChange: Event<any> = this._provider.onDidChange

  addStatus (status: ILanguageStatus): IDisposable {
    return this._provider.register(status.selector, status)
  }

  getLanguageStatus (model: ITextModel): ILanguageStatus[] {
    return this._provider.ordered(model).sort((a, b) => {
      let res = b.severity - a.severity
      if (res === 0) {
        res = compare(a.source, b.source)
      }
      if (res === 0) {
        res = compare(a.id, b.id)
      }
      return res
    })
  }
})

const focusTracker = trackFocus(window)
const onVisibilityChange = new DomEmitter(window.document, 'visibilitychange')

const onDidChangeFocus = Event.latch(Event.any(
  Event.map(focusTracker.onDidFocus, () => document.hasFocus()),
  Event.map(focusTracker.onDidBlur, () => document.hasFocus()),
  Event.map(onVisibilityChange.event, () => document.hasFocus())
))

registerSingleton(IHostService, class HostService implements IHostService {
  _serviceBrand: undefined

  onDidChangeFocus = onDidChangeFocus

  get hasFocus (): boolean {
    return document.hasFocus()
  }

  async hadLastFocus (): Promise<boolean> {
    return true
  }

  async focus (): Promise<void> {
    window.focus()
  }

  openWindow = unsupported

  async toggleFullScreen (): Promise<void> {
    if (document.fullscreenEnabled) {
      await document.body.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  }

  restart = unsupported
  reload = unsupported
  close = unsupported
})

registerSingleton(ILifecycleService, BrowserLifecycleService)

registerSingleton(ILanguageDetectionService, class LanguageDetectionService implements ILanguageDetectionService {
  _serviceBrand: undefined
  isEnabledForLanguage (): boolean {
    return false
  }

  async detectLanguage (): Promise<string | undefined> {
    return undefined
  }
})

registerSingleton(IExtensionService, NullExtensionService)

registerSingleton(IKeyboardLayoutService, class KeyboardLayoutService implements IKeyboardLayoutService {
  _serviceBrand: undefined
  onDidChangeKeyboardLayout = Event.None
  getRawKeyboardMapping = () => null
  getCurrentKeyboardLayout = () => null
  getAllKeyboardLayouts = () => []
  getKeyboardMapper = () => new MacLinuxFallbackKeyboardMapper(OS)
  validateCurrentKeyboardMapping = () => {}
}, true)

registerSingleton(IUserDataInitializationService, class NullUserDataInitializationService implements IUserDataInitializationService {
  _serviceBrand: undefined
  async requiresInitialization (): Promise<boolean> {
    return false
  }

  async whenInitializationFinished (): Promise<void> {}
  async initializeRequiredResources (): Promise<void> {}
  async initializeInstalledExtensions (): Promise<void> {}
  async initializeOtherResources (): Promise<void> {}
})

registerSingleton(IHostColorSchemeService, BrowserHostColorSchemeService)

registerSingleton(IPreferencesService, class PreferencesService implements IPreferencesService {
  _serviceBrand: undefined
  get userSettingsResource () { return unsupported() }
  workspaceSettingsResource = null
  getFolderSettingsResource = unsupported
  createPreferencesEditorModel = unsupported
  resolveModel = unsupported
  createSettings2EditorModel = unsupported
  openRawDefaultSettings = unsupported
  openSettings = unsupported
  openUserSettings = unsupported
  openRemoteSettings = unsupported
  openWorkspaceSettings = unsupported
  openFolderSettings = unsupported
  openGlobalKeybindingSettings = unsupported
  openDefaultKeybindingsFile = unsupported
  getEditableSettingsURI = unsupported
  createSplitJsonEditorInput = unsupported
  openApplicationSettings = unsupported
  openLanguageSpecificSettings = unsupported
})

registerSingleton(ITextMateService, class NullTextMateService implements ITextMateService {
  _serviceBrand: undefined
  onDidEncounterLanguage = Event.None
  createGrammar = unsupported
  startDebugMode = unsupported
})

const profile: IUserDataProfile = {
  id: 'default',
  isDefault: true,
  name: 'default',
  location: URI.from({ scheme: 'user', path: '/profile.json' }),
  get globalStorageHome () { return unsupported() },
  settingsResource: URI.from({ scheme: 'user', path: '/settings.json' }),
  keybindingsResource: URI.from({ scheme: 'user', path: '/keybindings.json' }),
  tasksResource: URI.from({ scheme: 'user', path: '/tasks.json' }),
  snippetsHome: URI.from({ scheme: 'user', path: '/snippets' }),
  extensionsResource: undefined
}

registerSingleton(IUserDataProfilesService, class UserDataProfilesService implements IUserDataProfilesService {
  _serviceBrand: undefined
  get profilesHome () { return unsupported() }
  defaultProfile = profile
  onDidChangeProfiles = Event.None
  profiles = [profile]
  createProfile = unsupported
  updateProfile = unsupported
  setProfileForWorkspace = unsupported
  getProfile = () => profile
  removeProfile = unsupported
})
class InjectedUserDataProfileService extends UserDataProfileService {
  constructor (@IUserDataProfilesService userDataProfilesService: IUserDataProfilesService) {
    super(profile, userDataProfilesService)
  }
}
registerSingleton(IUserDataProfileService, InjectedUserDataProfileService)

registerSingleton(IPolicyService, class PolicyService implements IPolicyService {
  _serviceBrand: undefined
  onDidChange = Event.None
  registerPolicyDefinitions = unsupported
  getPolicyValue = () => undefined
  serialize = () => undefined
})

registerSingleton(ISnippetsService, class SnippetsService implements ISnippetsService {
  _serviceBrand: undefined
  getSnippetFiles = unsupported
  isEnabled = unsupported
  updateEnablement = unsupported
  updateUsageTimestamp = unsupported
  getSnippets = async () => []
  getSnippetsSync = unsupported
})

registerSingleton(ISearchService, class SearchService implements ISearchService {
  _serviceBrand: undefined
  textSearch = unsupported
  fileSearch = unsupported
  clearCache = unsupported
  registerSearchResultProvider = unsupported
}, true)

registerSingleton(IWorkspaceEditingService, class WorkspaceEditingService implements IWorkspaceEditingService {
  _serviceBrand: undefined
  addFolders = unsupported
  removeFolders = unsupported
  updateFolders = unsupported
  enterWorkspace = unsupported
  createAndEnterWorkspace = unsupported
  saveAndEnterWorkspace = unsupported
  copyWorkspaceSettings = unsupported
  pickNewWorkspacePath = unsupported
}, true)

registerSingleton(IRequestService, RequestService)

registerSingleton(IWorkspaceTrustRequestService, class WorkspaceTrustRequestService implements IWorkspaceTrustRequestService {
  _serviceBrand: undefined
  onDidInitiateOpenFilesTrustRequest = Event.None
  onDidInitiateWorkspaceTrustRequest = Event.None
  onDidInitiateWorkspaceTrustRequestOnStartup = Event.None
  completeOpenFilesTrustRequest = unsupported
  requestOpenFilesTrust = unsupported
  cancelWorkspaceTrustRequest = unsupported
  completeWorkspaceTrustRequest = unsupported
  requestWorkspaceTrust = unsupported
  requestWorkspaceTrustOnStartup = unsupported
})

class SocketFactory implements ISocketFactory {
  connect = unsupported
}

registerSingleton(IRemoteAgentService, class RemoteAgentService implements IRemoteAgentService {
  _serviceBrand: undefined
  socketFactory = new SocketFactory()
  getConnection = () => null
  getEnvironment = async () => null
  getRawEnvironment = async () => null
  getExtensionHostExitInfo = async () => null
  getRoundTripTime = async () => undefined
  whenExtensionsReady = async () => undefined
  scanExtensions = async () => []
  scanSingleExtension = async () => null
  getDiagnosticInfo = async () => undefined
  updateTelemetryLevel = async () => undefined
  logTelemetry = async () => undefined
  flushTelemetry = async () => undefined
})

registerSingleton(IWorkingCopyBackupService, InMemoryWorkingCopyBackupService)
registerSingleton(IWorkingCopyService, WorkingCopyService, true)
registerSingleton(IFilesConfigurationService, FilesConfigurationService)
registerSingleton(IDecorationsService, DecorationsService)
registerSingleton(IElevatedFileService, BrowserElevatedFileService)
registerSingleton(IFileDialogService, class FileDialogService implements IFileDialogService {
  _serviceBrand: undefined
  defaultFilePath = unsupported
  defaultFolderPath = unsupported
  defaultWorkspacePath = unsupported
  pickFileFolderAndOpen = unsupported
  pickFileAndOpen = unsupported
  pickFolderAndOpen = unsupported
  pickWorkspaceAndOpen = unsupported
  pickFileToSave = unsupported
  showSaveDialog = unsupported
  showSaveConfirm = unsupported
  showOpenDialog = unsupported
})
registerSingleton(IUntitledTextEditorService, class UntitledTextEditorService implements IUntitledTextEditorService {
  _serviceBrand: undefined
  onDidChangeDirty = Event.None
  onDidChangeEncoding = Event.None
  onDidChangeLabel = Event.None
  onWillDispose = Event.None
  create = unsupported
  get = unsupported
  getValue = unsupported
  resolve = unsupported
}, true)

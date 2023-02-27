import { ExtHostCommands } from 'vs/workbench/api/common/extHostCommands'
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService'
import { ConsoleMainLogger, ILogService, LogLevel, LogService } from 'vs/platform/log/common/log'
import { MainThreadCommands } from 'vs/workbench/api/browser/mainThreadCommands'
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers'
import { ExtensionHostKind, IExtensionService } from 'vs/workbench/services/extensions/common/extensions'
import { Event } from 'vs/base/common/event'
import { ExtensionIdentifier, IExtensionDescription, TargetPlatform } from 'vs/platform/extensions/common/extensions'
import { URI } from 'vs/base/common/uri'
import { ExtHostApiDeprecationService } from 'vs/workbench/api/common/extHostApiDeprecationService'
import { ExtHostConfigurationShape, ExtHostContext, IConfigurationInitData, IMainContext, MainContext, MainThreadConfigurationShape } from 'vs/workbench/api/common/extHost.protocol'
import { ExtHostDiagnostics } from 'vs/workbench/api/common/extHostDiagnostics'
import { ExtHostFileSystemInfo } from 'vs/workbench/api/common/extHostFileSystemInfo'
import { IMessagePassingProtocol } from 'vs/base/parts/ipc/common/ipc'
import { RPCProtocol } from 'vs/workbench/services/extensions/common/rpcProtocol'
import { BufferedEmitter } from 'vs/base/parts/ipc/common/ipc.net'
import { VSBuffer } from 'vs/base/common/buffer'
import { Proxied, ProxyIdentifier } from 'vs/workbench/services/extensions/common/proxyIdentifier'
import { ExtHostDocuments } from 'vs/workbench/api/common/extHostDocuments'
import { createExtHostQuickOpen } from 'vs/workbench/api/common/extHostQuickOpen'
import { ExtHostWorkspace, IExtHostWorkspace, IExtHostWorkspaceProvider } from 'vs/workbench/api/common/extHostWorkspace'
import { MainThreadQuickOpen } from 'vs/workbench/api/browser/mainThreadQuickOpen'
import { ExtHostMessageService } from 'vs/workbench/api/common/extHostMessageService'
import { MainThreadMessageService } from 'vs/workbench/api/browser/mainThreadMessageService'
import { ExtHostProgress } from 'vs/workbench/api/common/extHostProgress'
import { MainThreadProgress } from 'vs/workbench/api/browser/mainThreadProgress'
import { MainThreadDocumentContentProviders } from 'vs/workbench/api/browser/mainThreadDocumentContentProviders'
import { ExtHostDocumentContentProvider } from 'vs/workbench/api/common/extHostDocumentContentProviders'
import { ExtHostDocumentsAndEditors } from 'vs/workbench/api/common/extHostDocumentsAndEditors'
import { ExtHostEditors } from 'vs/workbench/api/common/extHostTextEditors'
import { MainThreadDocumentsAndEditors } from 'vs/workbench/api/browser/mainThreadDocumentsAndEditors'
import { MainThreadDiagnostics } from 'vs/workbench/api/browser/mainThreadDiagnostics'
import { MainThreadTelemetry } from 'vs/workbench/api/browser/mainThreadTelemetry'
import { StandaloneServices } from 'vs/editor/standalone/browser/standaloneServices'
import { ICommandService } from 'vs/platform/commands/common/commands'
import { INotificationService } from 'vs/platform/notification/common/notification'
import { IDialogService } from 'vs/platform/dialogs/common/dialogs'
import { ITextModelService } from 'vs/editor/common/services/resolverService'
import { IModelService } from 'vs/editor/common/services/model'
import { ILanguageService } from 'vs/editor/common/languages/language'
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput'
import { IEditorWorkerService } from 'vs/editor/common/services/editorWorker'
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService'
import { IMarkerService } from 'vs/platform/markers/common/markers'
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService'
import { IEditorService } from 'vs/workbench/services/editor/common/editorService'
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity'
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite'
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles'
import { IFileService } from 'vs/platform/files/common/files'
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService'
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService'
import { IWorkingCopyFileService } from 'vs/workbench/services/workingCopy/common/workingCopyFileService'
import { IPathService } from 'vs/workbench/services/path/common/pathService'
import { IProgressService } from 'vs/platform/progress/common/progress'
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry'
import { IProductService } from 'vs/platform/product/common/productService'
import { ExtHostBulkEdits } from 'vs/workbench/api/common/extHostBulkEdits'
import { MainThreadBulkEdits } from 'vs/workbench/api/browser/mainThreadBulkEdits'
import { IBulkEditService } from 'vs/editor/browser/services/bulkEditService'
import { ExtHostLanguages } from 'vs/workbench/api/common/extHostLanguages'
import { MainThreadLanguages } from 'vs/workbench/api/browser/mainThreadLanguages'
import { ILanguageStatusService } from 'vs/workbench/services/languageStatus/common/languageStatusService'
import { URITransformerService } from 'vs/workbench/api/common/extHostUriTransformerService'
import { ExtHostWindow } from 'vs/workbench/api/common/extHostWindow'
import { MainThreadWindow } from 'vs/workbench/api/browser/mainThreadWindow'
import { IOpenerService } from 'vs/platform/opener/common/opener'
import { IHostService } from 'vs/workbench/services/host/browser/host'
import './missing-services'
import { MainThreadClipboard } from 'vs/workbench/api/browser/mainThreadClipboard'
import { ExtHostClipboard } from 'vs/workbench/api/common/extHostClipboard'
import { ExtHostTelemetry } from 'vs/workbench/api/common/extHostTelemetry'
import { ExtHostLanguageFeatures } from 'vs/workbench/api/common/extHostLanguageFeatures'
import { MainThreadLanguageFeatures } from 'vs/workbench/api/browser/mainThreadLanguageFeatures'
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry'
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures'
import { IConfigurationChange, IConfigurationService } from 'vs/platform/configuration/common/configuration'
import { ExtHostConfigProvider } from 'vs/workbench/api/common/extHostConfiguration'
import { IExtHostInitDataService } from 'vs/workbench/api/common/extHostInitDataService'
import { MainThreadConfiguration } from 'vs/workbench/api/browser/mainThreadConfiguration'
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace'
import { UIKind } from 'vs/workbench/services/extensions/common/extensionHostProtocol'
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation'
import { MainThreadWorkspace } from 'vs/workbench/api/browser/mainThreadWorkspace'
import { ISearchService } from 'vs/workbench/services/search/common/search'
import { IWorkspaceEditingService } from 'vs/workbench/services/workspaces/common/workspaceEditing'
import { IRequestService } from 'vs/platform/request/common/request'
import { ILabelService } from 'vs/platform/label/common/label'
import { IWorkspaceTrustManagementService, IWorkspaceTrustRequestService } from 'vs/platform/workspace/common/workspaceTrust'
import { Services } from '../services'
import { unsupported } from '../tools'

export const DEFAULT_EXTENSION: IExtensionDescription = {
  identifier: new ExtensionIdentifier('monaco'),
  isBuiltin: true,
  isUserBuiltin: true,
  isUnderDevelopment: false,
  extensionLocation: URI.from({ scheme: 'extension', path: '/' }),
  name: 'monaco',
  publisher: 'microsoft',
  version: '1.0.0',
  engines: {
    vscode: VSCODE_VERSION
  },
  targetPlatform: TargetPlatform.WEB
}

class SimpleMessagePassingProtocol implements IMessagePassingProtocol {
  private readonly _onMessage = new BufferedEmitter<VSBuffer>()
  readonly onMessage: Event<VSBuffer> = this._onMessage.event
  send (buffer: VSBuffer): void {
    this._onMessage.fire(buffer)
  }
}

class MainThreadMessageServiceWithoutSource extends MainThreadMessageService {
  override $showMessage: MainThreadMessageService['$showMessage'] = (severity, message, options, commands) => {
    // Remove the source from the message so there is no "Extension Settings" button on notifications
    const _options = {
      ...options,
      source: undefined
    }
    return super.$showMessage(severity, message, _options, commands)
  }
}

/**
 * The vscode ExtHostConfiguration use a barrier and its getConfigProvider returns a promise, let's use a simpler version
 */
export class SyncExtHostConfiguration implements ExtHostConfigurationShape {
  readonly _serviceBrand: undefined

  private readonly _proxy: MainThreadConfigurationShape
  private readonly _logService: ILogService
  private readonly _extHostWorkspace: ExtHostWorkspace
  private _actual: ExtHostConfigProvider | null

  constructor (
    @IExtHostRpcService extHostRpc: IExtHostRpcService,
    @IExtHostWorkspace extHostWorkspace: IExtHostWorkspace,
    @ILogService logService: ILogService
  ) {
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadConfiguration)
    this._extHostWorkspace = extHostWorkspace
    this._logService = logService
    this._actual = null
  }

  public getConfigProvider (): ExtHostConfigProvider {
    return this._actual!
  }

  $initializeConfiguration (data: IConfigurationInitData): void {
    this._actual = new ExtHostConfigProvider(this._proxy, this._extHostWorkspace, data, this._logService)
  }

  $acceptConfigurationChanged (data: IConfigurationInitData, change: IConfigurationChange): void {
    this.getConfigProvider().$acceptConfigurationChanged(data, change)
  }
}

function createExtHostServices () {
  const commandsService = StandaloneServices.get(ICommandService)
  const notificationService = StandaloneServices.get(INotificationService)
  const dialogService = StandaloneServices.get(IDialogService)
  const textModelService = StandaloneServices.get(ITextModelService)
  const modelService = StandaloneServices.get(IModelService)
  const languageService = StandaloneServices.get(ILanguageService)
  const editorWorkerService = StandaloneServices.get(IEditorWorkerService)
  const quickInputService = StandaloneServices.get(IQuickInputService)
  const codeEditorService = StandaloneServices.get(ICodeEditorService)
  const markerService = StandaloneServices.get(IMarkerService)
  const clipboardService = StandaloneServices.get(IClipboardService)
  const editorService = StandaloneServices.get(IEditorService)
  const uriIdentityService = StandaloneServices.get(IUriIdentityService)
  const paneCompositePartService = StandaloneServices.get(IPaneCompositePartService)
  const textFileService = StandaloneServices.get(ITextFileService)
  const fileService = StandaloneServices.get(IFileService)
  const editorGroupsService = StandaloneServices.get(IEditorGroupsService)
  const workbenchEnvironmentService = StandaloneServices.get(IWorkbenchEnvironmentService)
  const workingCopyFileService = StandaloneServices.get(IWorkingCopyFileService)
  const pathService = StandaloneServices.get(IPathService)
  const progressService = StandaloneServices.get(IProgressService)
  const telemetryService = StandaloneServices.get(ITelemetryService)
  const productService = StandaloneServices.get(IProductService)
  const bulkEditService = StandaloneServices.get(IBulkEditService)
  const languageStatusService = StandaloneServices.get(ILanguageStatusService)
  const openerService = StandaloneServices.get(IOpenerService)
  const hostService = StandaloneServices.get(IHostService)
  const languageConfigurationService = StandaloneServices.get(ILanguageConfigurationService)
  const languageFeaturesService = StandaloneServices.get(ILanguageFeaturesService)
  const configurationService = StandaloneServices.get(IConfigurationService)
  const workspaceContextService = StandaloneServices.get(IWorkspaceContextService)
  const extensionService = StandaloneServices.get(IExtensionService)
  const searchService = StandaloneServices.get(ISearchService)
  const workspaceEditingService = StandaloneServices.get(IWorkspaceEditingService)
  const requestService = StandaloneServices.get(IRequestService)
  const labelService = StandaloneServices.get(ILabelService)
  const workspaceTrustManagementService = StandaloneServices.get(IWorkspaceTrustManagementService)
  const workspaceTrustRequestService = StandaloneServices.get(IWorkspaceTrustRequestService)
  const instantiationService = StandaloneServices.get(IInstantiationService)

  const imessagePassingProtocol = new SimpleMessagePassingProtocol()

  const rpcProtocol = new RPCProtocol(imessagePassingProtocol)

  const extHostFileSystemInfo = new ExtHostFileSystemInfo()

  const mainContext: IMainContext & IExtHostRpcService & IExtHostContext = {
    _serviceBrand: undefined,
    remoteAuthority: null,
    extensionHostKind: ExtensionHostKind.LocalProcess,
    getProxy: function <T> (identifier: ProxyIdentifier<T>): Proxied<T> {
      return rpcProtocol.getProxy(identifier)
    },
    set: function <T, R extends T> (identifier: ProxyIdentifier<T>, instance: R): R {
      return rpcProtocol.set(identifier, instance)
    },
    assertRegistered: function (identifiers: ProxyIdentifier<unknown>[]): void {
      rpcProtocol.assertRegistered(identifiers)
    },
    drain: function (): Promise<void> {
      return rpcProtocol.drain()
    },
    dispose () {
      rpcProtocol.dispose()
    }
  }

  const initData: IExtHostInitDataService = {
    _serviceBrand: undefined,
    version: '1.0.0',
    parentPid: 0,
    get environment () { return unsupported() },
    allExtensions: [Services.get().extension ?? DEFAULT_EXTENSION],
    myExtensions: [(Services.get().extension ?? DEFAULT_EXTENSION).identifier],
    consoleForward: {
      includeStack: false,
      logNative: false
    },
    get telemetryInfo () { return unsupported() },
    logLevel: LogLevel.Trace,
    get logsLocation () { return unsupported() },
    get logFile () { return unsupported() },
    autoStart: false,
    remote: {
      isRemote: false,
      authority: undefined,
      connectionData: null
    },
    uiKind: UIKind.Web
  }

  const extHostLogService = new LogService(new ConsoleMainLogger())
  const extHostApiDeprecationService = new ExtHostApiDeprecationService(mainContext, extHostLogService)
  const extHostMessageService = new ExtHostMessageService(mainContext, extHostLogService)
  const uriTransformerService = new URITransformerService(null)

  // They must be defined BEFORE ExtHostCommands
  rpcProtocol.set(MainContext.MainThreadWindow, new MainThreadWindow(mainContext, hostService, openerService))
  rpcProtocol.set(MainContext.MainThreadCommands, new MainThreadCommands(mainContext, commandsService, extensionService))

  const extHostCommands = rpcProtocol.set(ExtHostContext.ExtHostCommands, new ExtHostCommands(mainContext, extHostLogService))
  const extHostDocumentsAndEditors = rpcProtocol.set(ExtHostContext.ExtHostDocumentsAndEditors, new ExtHostDocumentsAndEditors(mainContext, extHostLogService))
  const extHostDocuments = rpcProtocol.set(ExtHostContext.ExtHostDocuments, new ExtHostDocuments(mainContext, extHostDocumentsAndEditors))
  const extHostLanguages = rpcProtocol.set(ExtHostContext.ExtHostLanguages, new ExtHostLanguages(mainContext, extHostDocuments, extHostCommands.converter, uriTransformerService))
  const extHostWindow = rpcProtocol.set(ExtHostContext.ExtHostWindow, new ExtHostWindow(mainContext))
  const extHostQuickOpen = rpcProtocol.set(ExtHostContext.ExtHostQuickOpen, createExtHostQuickOpen(mainContext, <IExtHostWorkspaceProvider><unknown>null, extHostCommands))
  const extHostDiagnostics = rpcProtocol.set(ExtHostContext.ExtHostDiagnostics, new ExtHostDiagnostics(mainContext, extHostLogService, extHostFileSystemInfo))
  const extHostProgress = rpcProtocol.set(ExtHostContext.ExtHostProgress, new ExtHostProgress(rpcProtocol.getProxy(MainContext.MainThreadProgress)))
  const extHostDocumentContentProviders = rpcProtocol.set(ExtHostContext.ExtHostDocumentContentProviders, new ExtHostDocumentContentProvider(mainContext, extHostDocumentsAndEditors, extHostLogService))
  const extHostEditors = rpcProtocol.set(ExtHostContext.ExtHostEditors, new ExtHostEditors(mainContext, extHostDocumentsAndEditors))
  const extHostClipboard = new ExtHostClipboard(mainContext)
  const extHostLanguageFeatures = rpcProtocol.set(ExtHostContext.ExtHostLanguageFeatures, new ExtHostLanguageFeatures(rpcProtocol, uriTransformerService, extHostDocuments, extHostCommands, extHostDiagnostics, extHostLogService, extHostApiDeprecationService))
  const extHostWorkspace = rpcProtocol.set(ExtHostContext.ExtHostWorkspace, new ExtHostWorkspace(mainContext, initData, extHostFileSystemInfo, extHostLogService))
  const extHostConfiguration = rpcProtocol.set(ExtHostContext.ExtHostConfiguration, new SyncExtHostConfiguration(mainContext, extHostWorkspace, extHostLogService))

  rpcProtocol.set(ExtHostContext.ExtHostTelemetry, new ExtHostTelemetry())
  rpcProtocol.set(MainContext.MainThreadMessageService, new MainThreadMessageServiceWithoutSource(mainContext, notificationService, commandsService, dialogService))
  rpcProtocol.set(MainContext.MainThreadDiagnostics, new MainThreadDiagnostics(mainContext, markerService, uriIdentityService))
  rpcProtocol.set(MainContext.MainThreadQuickOpen, new MainThreadQuickOpen(mainContext, quickInputService))
  rpcProtocol.set(MainContext.MainThreadTelemetry, new MainThreadTelemetry(mainContext, telemetryService, workbenchEnvironmentService, productService))
  rpcProtocol.set(MainContext.MainThreadProgress, new MainThreadProgress(mainContext, progressService, commandsService))
  rpcProtocol.set(MainContext.MainThreadDocumentContentProviders, new MainThreadDocumentContentProviders(mainContext, textModelService, languageService, modelService, editorWorkerService))
  rpcProtocol.set(MainContext.MainThreadBulkEdits, new MainThreadBulkEdits(mainContext, bulkEditService, extHostLogService))
  rpcProtocol.set(MainContext.MainThreadLanguages, new MainThreadLanguages(mainContext, languageService, modelService, textModelService, languageStatusService))
  rpcProtocol.set(MainContext.MainThreadClipboard, new MainThreadClipboard(mainContext, clipboardService))
  rpcProtocol.set(MainContext.MainThreadLanguageFeatures, new MainThreadLanguageFeatures(mainContext, languageService, languageConfigurationService, languageFeaturesService))
  rpcProtocol.set(MainContext.MainThreadConfiguration, new MainThreadConfiguration(mainContext, workspaceContextService, configurationService, workbenchEnvironmentService))
  rpcProtocol.set(MainContext.MainThreadWorkspace, new MainThreadWorkspace(mainContext, searchService, workspaceContextService, editorService, workspaceEditingService, notificationService, requestService, instantiationService, labelService, workbenchEnvironmentService, fileService, workspaceTrustManagementService, workspaceTrustRequestService))

  // eslint-disable-next-line no-new
  new MainThreadDocumentsAndEditors(
    mainContext,
    modelService,
    textFileService,
    editorService,
    codeEditorService,
    fileService,
    textModelService,
    editorGroupsService,
    paneCompositePartService,
    workbenchEnvironmentService,
    workingCopyFileService,
    uriIdentityService,
    clipboardService,
    pathService,
    instantiationService
  )

  const extHostBulkEdits = new ExtHostBulkEdits(mainContext, extHostDocumentsAndEditors)

  return {
    extHostLogService,
    extHostApiDeprecationService,
    extHostMessageService,
    extHostDocumentsAndEditors,
    extHostBulkEdits,
    extHostDocuments,
    extHostDocumentContentProviders,
    extHostQuickOpen,
    extHostProgress,
    extHostDiagnostics,
    extHostEditors,
    extHostCommands,
    extHostLanguages,
    extHostWindow,
    extHostClipboard,
    extHostLanguageFeatures,
    extHostWorkspace,
    extHostConfiguration
  }
}

type ExtHostServices = ReturnType<typeof createExtHostServices>
let extHostServices: ExtHostServices | undefined

export function getExtHostServices (): ExtHostServices {
  if (extHostServices == null) {
    extHostServices = createExtHostServices()
  }
  return extHostServices
}

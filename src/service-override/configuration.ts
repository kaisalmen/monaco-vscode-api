import '../polyfill'
import '../vscode-services/missing-services'
import { IEditorOverrideServices, StandaloneServices } from 'vs/editor/standalone/browser/standaloneServices'
import { WorkspaceService, RegisterConfigurationSchemasContribution } from 'vs/workbench/services/configuration/browser/configurationService'
import { IConfigurationService } from 'vs/platform/configuration/common/configuration'
import { ITextResourceConfigurationService } from 'vs/editor/common/services/textResourceConfiguration'
import { TextResourceConfigurationService } from 'vs/editor/common/services/textResourceConfigurationService'
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors'
import { IConfigurationRegistry, Extensions as ConfigurationExtensions, ConfigurationScope, IConfigurationNode, IConfigurationDefaults } from 'vs/platform/configuration/common/configurationRegistry'
import { Registry } from 'vs/platform/registry/common/platform'
import { VSBuffer } from 'vs/base/common/buffer'
import { IFileService } from 'vs/platform/files/common/files'
import { ILogService } from 'vs/platform/log/common/log'
import { IColorCustomizations, IThemeScopedColorCustomizations } from 'vs/workbench/services/themes/common/workbenchThemeService'
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile'
import { IPolicyService } from 'vs/platform/policy/common/policy'
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation'
import type * as vscode from 'vscode'
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile'
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService'
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity'
import { ConfigurationCache } from 'vs/workbench/services/configuration/common/configurationCache'
import { Schemas } from 'vs/base/common/network'
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService'
import { ISingleFolderWorkspaceIdentifier, IWorkspaceContextService } from 'vs/platform/workspace/common/workspace'
import { URI } from 'vs/base/common/uri'
import { onUnexpectedError } from 'vs/base/common/errors'
import { LabelService } from 'vs/workbench/services/label/common/labelService'
import { ILabelService } from 'vs/platform/label/common/label'
import { onServicesInitialized } from './tools'
import getFileServiceOverride from './files'

async function updateUserConfiguration (configurationJson: string): Promise<void> {
  const userDataProfilesService = StandaloneServices.get(IUserDataProfilesService)
  await StandaloneServices.get(IFileService).writeFile(userDataProfilesService.defaultProfile.settingsResource, VSBuffer.fromString(configurationJson))
}

async function getUserConfiguration (): Promise<string> {
  const userDataProfilesService = StandaloneServices.get(IUserDataProfilesService)
  return (await StandaloneServices.get(IFileService).readFile(userDataProfilesService.defaultProfile.settingsResource)).value.toString()
}

function onUserConfigurationChange (callback: () => void): vscode.Disposable {
  const userDataProfilesService = StandaloneServices.get(IUserDataProfilesService)
  return StandaloneServices.get(IFileService).onDidFilesChange(e => {
    if (e.affects(userDataProfilesService.defaultProfile.settingsResource)) {
      callback()
    }
  })
}

const configurationRegistry = Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration)

class InjectedConfigurationService extends WorkspaceService {
  constructor (
    @IWorkbenchEnvironmentService workbenchEnvironmentService: IWorkbenchEnvironmentService,
    @IUserDataProfileService userDataProfileService: IUserDataProfileService,
    @IUserDataProfilesService userDataProfilesService: IUserDataProfilesService,
    @IFileService fileService: IFileService,
    @IRemoteAgentService remoteAgentService: IRemoteAgentService,
    @IUriIdentityService uriIdentityService: IUriIdentityService,
    @ILogService logService: ILogService,
    @IPolicyService policyService: IPolicyService
  ) {
    const configurationCache = new ConfigurationCache([Schemas.file, Schemas.vscodeUserData, Schemas.tmp], workbenchEnvironmentService, fileService)
    super({ configurationCache }, workbenchEnvironmentService, userDataProfileService, userDataProfilesService, fileService, remoteAgentService, uriIdentityService, logService, policyService)
  }
}

function initialize (instantiationService: IInstantiationService, workspaceFolderUri: URI) {
  const workspaceFolder: ISingleFolderWorkspaceIdentifier = {
    id: '4064f6ec-cb38-4ad0-af64-ee6467e63c82',
    uri: workspaceFolderUri
  }
  const workspaceService = StandaloneServices.get(IWorkspaceContextService) as WorkspaceService
  workspaceService.acquireInstantiationService(instantiationService)
  ;(StandaloneServices.get(IConfigurationService) as WorkspaceService).acquireInstantiationService(instantiationService)
  workspaceService.initialize(workspaceFolder).then(() => {
    instantiationService.createInstance(RegisterConfigurationSchemasContribution)
  }, onUnexpectedError)
}

export default function getServiceOverride (workspaceFolderUri: URI = URI.file('/tmp/project')): IEditorOverrideServices {
  onServicesInitialized((instantiationService) => initialize(instantiationService, workspaceFolderUri))
  return {
    ...getFileServiceOverride(),
    [ILabelService.toString()]: new SyncDescriptor(LabelService, undefined, true),
    // TODO return same instance for both
    [IConfigurationService.toString()]: new SyncDescriptor(InjectedConfigurationService),
    [IWorkspaceContextService.toString()]: new SyncDescriptor(InjectedConfigurationService),
    [ITextResourceConfigurationService.toString()]: new SyncDescriptor(TextResourceConfigurationService)
  }
}

export {
  updateUserConfiguration,
  getUserConfiguration,
  onUserConfigurationChange,
  configurationRegistry,
  ConfigurationScope,
  IThemeScopedColorCustomizations,
  IColorCustomizations,
  IConfigurationNode,
  IConfigurationDefaults
}

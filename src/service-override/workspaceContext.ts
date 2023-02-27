import '../polyfill'
import '../vscode-services/missing-services'
import { IEditorOverrideServices } from 'vs/editor/standalone/browser/standaloneServices'

export default function getServiceOverride (): IEditorOverrideServices {
  return {
    // [IWorkspaceContextService.toString()]: new SyncDescriptor(SimpleWorkspaceContextService)
  }
}

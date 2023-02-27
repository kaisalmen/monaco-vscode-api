import '../polyfill'
import '../vscode-services/missing-services'
import { IEditorOverrideServices } from 'vs/editor/standalone/browser/standaloneServices'
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors'
import { FileService } from 'vs/platform/files/common/fileService'
import { ILogService } from 'vs/platform/log/common/log'
import { InMemoryFileSystemProvider } from 'vs/platform/files/common/inMemoryFilesystemProvider'
import { AbstractExtensionResourceLoaderService, IExtensionResourceLoaderService } from 'vs/workbench/services/extensionResourceLoader/common/extensionResourceLoader'
import { Event, IDisposable, URI } from 'vs/workbench/workbench.web.main'
import { FileSystemProviderCapabilities, FileSystemProviderError, FileSystemProviderErrorCode, FileType, IFileSystemProviderWithFileReadWriteCapability, IStat } from 'vs/platform/files/common/files'
import { registerSingleton } from 'vs/platform/instantiation/common/extensions'
import { IStorageService } from 'vs/platform/storage/common/storage'
import { IConfigurationService } from 'vs/platform/configuration/common/configuration'
import { IEnvironmentService } from 'vs/platform/environment/common/environment'
import { IProductService } from 'vs/platform/product/common/productService'
import { Disposable } from 'vs/workbench/api/common/extHostTypes'
import { DEFAULT_EXTENSION } from '../vscode-services/extHost'
import { unsupported } from '../tools'
import { IFileService, Services } from '../services'

class SimpleExtensionResourceLoaderService extends AbstractExtensionResourceLoaderService {
  // required for injection
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor (
    @IFileService fileService: IFileService,
    @IStorageService storageService: IStorageService,
    @IProductService productService: IProductService,
    @IEnvironmentService environmentService: IEnvironmentService,
    @IConfigurationService configurationService: IConfigurationService
  ) {
    super(fileService, storageService, productService, environmentService, configurationService)
  }

  async readExtensionResource (uri: URI): Promise<string> {
    const result = await this._fileService.readFile(uri)
    return result.value.toString()
  }
}
registerSingleton(IExtensionResourceLoaderService, SimpleExtensionResourceLoaderService)

class File implements IStat {
  ctime: number
  mtime: number
  size: number
  type: FileType
  constructor (public getContent: () => Promise<string>) {
    this.ctime = Date.now()
    this.mtime = Date.now()
    this.size = 0
    this.type = FileType.File
  }
}
const encoder = new TextEncoder()
class ExtensionFileSystemProviderWithFileReadWriteCapability implements IFileSystemProviderWithFileReadWriteCapability {
  capabilities = FileSystemProviderCapabilities.FileReadWrite | FileSystemProviderCapabilities.PathCaseSensitive

  private files: Map<string, File>
  constructor () {
    this.files = new Map<string, File>()
  }

  async stat (resource: URI): Promise<IStat> {
    const file = this.files.get(resource.toString())
    if (file != null) {
      return file
    }
    throw new FileSystemProviderError('file not found', FileSystemProviderErrorCode.FileNotFound)
  }

  async readFile (resource: URI): Promise<Uint8Array> {
    const file = this.files.get(resource.toString())
    if (file != null) {
      return encoder.encode(await file.getContent())
    }

    throw new FileSystemProviderError('file not found', FileSystemProviderErrorCode.FileNotFound)
  }

  watch (): IDisposable {
    // ignore
    return {
      dispose () {}
    }
  }

  public registerFile (resource: URI, getContent: () => Promise<string>): Disposable {
    this.files.set(resource.toString(), new File(getContent))
    return new Disposable(() => {
      this.files.delete(resource.toString())
    })
  }

  onDidChangeFile = Event.None
  onDidChangeCapabilities = Event.None
  onDidWatchError = Event.None
  writeFile = unsupported
  mkdir = unsupported
  readdir = unsupported
  delete = unsupported
  rename = unsupported
}
const extensionFileSystemProvider = new ExtensionFileSystemProviderWithFileReadWriteCapability()

class MemoryFileService extends FileService {
  constructor (@ILogService logService: ILogService) {
    super(logService)

    this.registerProvider('user', new InMemoryFileSystemProvider())
    this.registerProvider('cache', new InMemoryFileSystemProvider())
    this.registerProvider('file', new InMemoryFileSystemProvider())

    const extension = Services.get().extension ?? DEFAULT_EXTENSION
    this.registerProvider(extension.extensionLocation.scheme, extensionFileSystemProvider)
  }
}

export function registerExtensionFile (resource: URI, getContent: () => Promise<string>): Disposable {
  return extensionFileSystemProvider.registerFile(resource, getContent)
}

export default function getServiceOverride (): IEditorOverrideServices {
  return {
    [IFileService.toString()]: new SyncDescriptor(MemoryFileService),
    [IExtensionResourceLoaderService.toString()]: new SyncDescriptor(SimpleExtensionResourceLoaderService)
  }
}

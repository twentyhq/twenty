import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { createHash } from 'crypto';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { LogicFunctionDriverType } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { ConfigGroupHashService } from 'src/engine/core-modules/twenty-config/services/config-group-hash.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { FRONT_COMPONENT_MAX_BUILD_OUTPUT_BYTES } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-max-build-output-bytes.constant';
import { FRONT_COMPONENT_WRAPPER_NAME } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-wrapper-name.constant';
import { FrontComponentBuildException } from 'src/engine/metadata-modules/ai/ai-front-component/exceptions/front-component-build.exception';
import { FrontComponentDependencyManagerService } from 'src/engine/metadata-modules/ai/ai-front-component/front-component-dependency-manager.service';
import { FrontComponentDriverFactory } from 'src/engine/metadata-modules/ai/ai-front-component/front-component-drivers/front-component-driver.factory';
import { type FrontComponentBuildInput } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-build-input.type';
import { buildFrontComponentEntrySource } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component-entry-source.util';
import { convertFrontComponentBuildFailureToException } from 'src/engine/metadata-modules/ai/ai-front-component/utils/convert-front-component-build-failure-to-exception.util';
import { readFrontComponentSharedDependenciesChecksum } from 'src/engine/metadata-modules/ai/ai-front-component/utils/read-front-component-shared-dependencies-checksum.util';
import { WorkspaceFrontComponentDependenciesService } from 'src/engine/metadata-modules/ai/ai-front-component/workspace-front-component-dependencies.service';
import {
  FrontComponentException,
  FrontComponentExceptionCode,
} from 'src/engine/metadata-modules/front-component/front-component.exception';

@Injectable()
export class FrontComponentCompilerService implements OnModuleDestroy {
  private readonly driverFactory: FrontComponentDriverFactory;
  private readonly dependencyManager: FrontComponentDependencyManagerService;

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    configGroupHashService: ConfigGroupHashService,
    private readonly workspaceDependencies: WorkspaceFrontComponentDependenciesService,
    cacheLockService: CacheLockService,
    @InjectCacheStorage(CacheStorageNamespace.ModuleApplications)
    cacheStorage: CacheStorageService,
  ) {
    this.driverFactory = new FrontComponentDriverFactory(
      twentyConfigService,
      configGroupHashService,
      cacheLockService,
      cacheStorage,
    );
    this.dependencyManager = new FrontComponentDependencyManagerService(
      cacheLockService,
      cacheStorage,
    );
  }

  onModuleDestroy() {
    this.driverFactory.onModuleDestroy();
  }

  async build({
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: FrontComponentBuildInput;
  }) {
    const driverType = this.twentyConfigService.get('LOGIC_FUNCTION_TYPE');
    if (
      driverType !== LogicFunctionDriverType.LOCAL &&
      driverType !== LogicFunctionDriverType.LAMBDA
    ) {
      throw new FrontComponentException(
        'AI component compilation requires the LOCAL or LAMBDA logic-function driver.',
        FrontComponentExceptionCode.FRONT_COMPONENT_CREATE_FAILED,
      );
    }
    let source: string;
    try {
      source = buildFrontComponentEntrySource(input);
    } catch (error) {
      if (!(error instanceof FrontComponentBuildException)) {
        throw error;
      }
      throw convertFrontComponentBuildFailureToException({
        error: error.message,
        code: error.code,
      });
    }
    const driver = this.driverFactory.getCurrentDriver();
    const dependencies =
      await this.workspaceDependencies.readOrThrow(workspaceId);
    const builtDependencies =
      await this.dependencyManager.getSharedDependenciesOrThrow({
        workspaceId,
        dependencies,
        driver,
      });
    const built = await driver.transpile({
      workspaceId,
      input,
      manifest: {
        checksum: builtDependencies.checksum,
        exports: builtDependencies.exports,
      },
    });
    if (!built.success) {
      throw convertFrontComponentBuildFailureToException(built);
    }
    if (
      createHash('sha256').update(built.builtCode).digest('hex') !==
        built.checksum ||
      built.sharedDependenciesChecksum !== builtDependencies.checksum ||
      readFrontComponentSharedDependenciesChecksum(built.builtCode) !==
        builtDependencies.checksum ||
      Buffer.byteLength(built.builtCode) >
        FRONT_COMPONENT_MAX_BUILD_OUTPUT_BYTES
    ) {
      throw new FrontComponentException(
        'Frontend component build checksum mismatch.',
        FrontComponentExceptionCode.FRONT_COMPONENT_CREATE_FAILED,
      );
    }
    return {
      source,
      dependencyRevision: dependencies.revision,
      componentName: FRONT_COMPONENT_WRAPPER_NAME,
      compiledSource: built.builtCode,
      checksum: built.checksum,
      sharedDependencies: {
        source: builtDependencies.builtCode,
        checksum: builtDependencies.checksum,
        exportNamesBySpecifier: new Map(
          Object.entries(builtDependencies.exports),
        ),
      },
    };
  }
}

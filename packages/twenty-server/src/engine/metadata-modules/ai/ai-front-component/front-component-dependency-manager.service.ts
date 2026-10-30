import { isString } from '@sniptt/guards';
import { createHash } from 'crypto';
import { FileFolder } from 'twenty-shared/types';
import { v4 } from 'uuid';
import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { type FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { streamToBuffer } from 'src/utils/stream-to-buffer';
import { isDefined } from 'twenty-shared/utils';
import { type CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import {
  BUILD_LOCK_RETRY_MS,
  BUILD_LOCK_MAX_RETRIES,
  YARN_INSTALL_LAMBDA_TIMEOUT_SECONDS,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';
import { FRONT_COMPONENT_MAX_BUILD_OUTPUT_BYTES } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-max-build-output-bytes.constant';
import { type LogicFunctionDriver } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { frontComponentDependenciesBuildResultSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-dependencies-build-result.schema';
import { convertFrontComponentBuildFailureToException } from 'src/engine/metadata-modules/ai/ai-front-component/utils/convert-front-component-build-failure-to-exception.util';
import { type WorkspaceFrontComponentDependenciesService } from 'src/engine/metadata-modules/ai/ai-front-component/workspace-front-component-dependencies.service';
import {
  FrontComponentException,
  FrontComponentExceptionCode,
} from 'src/engine/metadata-modules/front-component/front-component.exception';

const DEPENDENCIES_CACHE_TTL = 30 * 24 * 60 * 60 * 1000;

export class FrontComponentDependencyManagerService {
  constructor(
    private readonly cacheLockService: CacheLockService,
    private readonly cacheStorage: CacheStorageService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async getSharedDependenciesOrThrow({
    workspaceId,
    dependencies,
    driver,
  }: {
    workspaceId: string;
    dependencies: Pick<
      Awaited<
        ReturnType<WorkspaceFrontComponentDependenciesService['readOrThrow']>
      >,
      | 'revision'
      | 'packageJson'
      | 'yarnLock'
      | 'applicationId'
      | 'applicationUniversalIdentifier'
    >;
    driver: LogicFunctionDriver;
  }) {
    const builderKey = await driver.getDependenciesBuildCacheKey({
      workspaceId,
    });
    const key = `ai-front-component-dependencies:${builderKey}:${dependencies.revision}`;
    return this.cacheLockService.withLock(
      async () => {
        const cached = await this.cacheStorage.get<unknown>(key);
        const location = {
          workspaceId,
          applicationUniversalIdentifier:
            dependencies.applicationUniversalIdentifier,
          fileFolder: FileFolder.Dependencies,
        };
        let cachedResult: unknown = cached;
        let resourcePath = isString(cached) ? cached : undefined;

        if (isDefined(resourcePath)) {
          try {
            const stream = await this.fileStorageService.readFile({
              ...location,
              resourcePath,
            });
            cachedResult = JSON.parse(
              (await streamToBuffer(stream)).toString(),
            );
          } catch (error) {
            if (error.code !== FileStorageExceptionCode.FILE_NOT_FOUND) {
              throw error;
            }
            cachedResult = undefined;
            resourcePath = undefined;
          }
        }

        const result = frontComponentDependenciesBuildResultSchema.parse(
          cachedResult ??
            (await driver.buildDependencies({
              targetRuntime: 'browser',
              workspaceId,
              packageJson: dependencies.packageJson,
              yarnLock: dependencies.yarnLock,
            })),
        );
        if (!result.success) {
          throw convertFrontComponentBuildFailureToException(result);
        }
        if (
          createHash('sha256').update(result.builtCode).digest('hex') !==
            result.checksum ||
          Buffer.byteLength(result.builtCode) >
            FRONT_COMPONENT_MAX_BUILD_OUTPUT_BYTES
        ) {
          throw new FrontComponentException(
            'Shared frontend component dependencies checksum mismatch.',
            FrontComponentExceptionCode.FRONT_COMPONENT_CREATE_FAILED,
          );
        }
        if (!isDefined(resourcePath)) {
          const expiresAt = Date.now() + DEPENDENCIES_CACHE_TTL;
          resourcePath = `front-component-builds/${v4()}.json`;
          await this.fileStorageService.writeFile({
            ...location,
            resourcePath,
            applicationId: dependencies.applicationId,
            sourceFile: JSON.stringify(result),
            settings: {
              isTemporaryFile: true,
              toDelete: false,
              expiresAt: new Date(expiresAt).toISOString(),
            },
          });
          await this.cacheStorage.set(
            key,
            resourcePath,
            Math.max(1, expiresAt - Date.now()),
          );
        }
        return result;
      },
      key,
      {
        ttl: (YARN_INSTALL_LAMBDA_TIMEOUT_SECONDS + 60) * 1000,
        ms: BUILD_LOCK_RETRY_MS,
        maxRetries: BUILD_LOCK_MAX_RETRIES,
      },
    );
  }
}

import { createHash } from 'crypto';
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

export class FrontComponentDependencyManagerService {
  constructor(
    private readonly cacheLockService: CacheLockService,
    private readonly cacheStorage: CacheStorageService,
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
      'revision' | 'packageJson' | 'yarnLock'
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
        const result = frontComponentDependenciesBuildResultSchema.parse(
          cached ??
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
        if (!isDefined(cached)) {
          await this.cacheStorage.set(key, result, 30 * 24 * 60 * 60 * 1000);
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

import { invokeFrontComponentBuilderLocally } from 'src/engine/metadata-modules/ai/ai-front-component/utils/invoke-front-component-builder-locally.util';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { YARN_ENGINE_DIRNAME } from 'src/engine/core-modules/application/application-package/constants/yarn-engine-dirname';
import {
  BUILD_LOCK_RETRY_MS,
  BUILD_LOCK_MAX_RETRIES,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';
import { FRONT_COMPONENT_BUILDER_LAMBDA_LIMITS } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-builder-lambda-limits.constant';
import { FRONT_COMPONENT_VENDOR_LAMBDA_LIMITS } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-vendor-lambda-limits.constant';
import { ensureFrontComponentLambdaExists } from 'src/engine/metadata-modules/ai/ai-front-component/utils/ensure-front-component-lambda-exists.util';
import { WorkspaceFrontComponentDependenciesService } from 'src/engine/metadata-modules/ai/ai-front-component/workspace-front-component-dependencies.service';
import { type FrontComponentBuilderRequest } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-builder-request.type';
import { frontComponentVendorResultSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-vendor-result.schema';
import { FRONT_COMPONENT_MAX_BUILD_OUTPUT_BYTES } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-max-build-output-bytes.constant';
import { FRONT_COMPONENT_WRAPPER_NAME } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-wrapper-name.constant';
import { buildFrontComponentEntrySource } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component-entry-source.util';
import { frontComponentQuerySchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-query.schema';
import { readFrontComponentSharedDependenciesChecksum } from 'src/engine/metadata-modules/ai/ai-front-component/utils/read-front-component-shared-dependencies-checksum.util';
import { Injectable } from '@nestjs/common';
import { isDefined } from 'twenty-shared/utils';
import { InvokeCommand } from '@aws-sdk/client-lambda';
import { createHash } from 'crypto';
import { promises as fileSystemPromises } from 'fs';
import { join } from 'path';
import { DriverFactoryBase } from 'src/engine/core-modules/twenty-config/dynamic-factory.base';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { ConfigGroupHashService } from 'src/engine/core-modules/twenty-config/services/config-group-hash.service';
import { ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';
import { LogicFunctionDriverType } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { LambdaAwsClientService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-aws-client.service';
import { LambdaToolFunctionsService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-tool-functions.service';
import { type LambdaConnectionOptions } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/types/lambda-driver.type';
import { getLambdaConnectionOptions } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-connection-options.util';
import { computeHashedLambdaResourceName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/compute-hashed-lambda-resource-name.util';
import { FRONT_COMPONENT_BUILD_ASSETS_DIRECTORY } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-build-assets-directory.constant';
import { type FrontComponentBuildInput } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-build-input.type';
import { frontComponentBuildResultSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-build-result.schema';
import {
  FrontComponentException,
  FrontComponentExceptionCode,
} from 'src/engine/metadata-modules/front-component/front-component.exception';

@Injectable()
export class FrontComponentCompilerService extends DriverFactoryBase<
  | { type: LogicFunctionDriverType.LOCAL }
  | {
      type: LogicFunctionDriverType.LAMBDA;
      awsClient: LambdaAwsClientService;
      toolFunctions: LambdaToolFunctionsService;
      options: LambdaConnectionOptions;
    }
> {
  constructor(
    twentyConfigService: TwentyConfigService,
    configGroupHashService: ConfigGroupHashService,
    private readonly workspaceDependencies: WorkspaceFrontComponentDependenciesService,
    private readonly cacheLockService: CacheLockService,
    @InjectCacheStorage(CacheStorageNamespace.ModuleApplications)
    private readonly cacheStorage: CacheStorageService,
  ) {
    super(twentyConfigService, configGroupHashService);
  }
  protected buildConfigKey(): string {
    return this.configGroupHashService.computeHash(
      ConfigVariablesGroup.LOGIC_FUNCTION_CONFIG,
    );
  }
  protected createDriver() {
    if (
      this.twentyConfigService.get('LOGIC_FUNCTION_TYPE') ===
      LogicFunctionDriverType.LOCAL
    ) {
      return { type: LogicFunctionDriverType.LOCAL as const };
    }
    const options = getLambdaConnectionOptions(this.twentyConfigService);
    const awsClient = new LambdaAwsClientService({
      ...options,
      cacheStorageService: this.cacheStorage,
    });
    const toolFunctions = new LambdaToolFunctionsService(options, awsClient);
    return {
      type: LogicFunctionDriverType.LAMBDA as const,
      awsClient,
      toolFunctions,
      options,
    };
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
    const source = buildFrontComponentEntrySource({
      ...input,
      query: frontComponentQuerySchema.parse(input.query),
    });
    const driver = this.getCurrentDriver();
    const dependencies =
      await this.workspaceDependencies.readOrThrow(workspaceId);
    const handlerSource = await fileSystemPromises.readFile(
      join(
        FRONT_COMPONENT_BUILD_ASSETS_DIRECTORY,
        driver.type === LogicFunctionDriverType.LOCAL ? 'local.js' : 'index.js',
      ),
      'utf8',
    );
    const functionName = computeHashedLambdaResourceName({
      resourceNamePrefix: 'twenty-front-component-builder',
      namespace:
        driver.type === LogicFunctionDriverType.LAMBDA
          ? driver.options.resourceNamespace
          : 'local',
      contents: [
        workspaceId,
        handlerSource,
        String(FRONT_COMPONENT_BUILDER_LAMBDA_LIMITS.memoryMb),
        String(FRONT_COMPONENT_BUILDER_LAMBDA_LIMITS.timeoutSeconds),
        String(FRONT_COMPONENT_BUILDER_LAMBDA_LIMITS.ephemeralStorageMb),
      ],
    });
    if (driver.type === LogicFunctionDriverType.LAMBDA) {
      await ensureFrontComponentLambdaExists({
        awsClient: driver.awsClient,
        toolFunctions: driver.toolFunctions,
        cacheLockService: this.cacheLockService,
        options: driver.options,
        functionName,
        limits: FRONT_COMPONENT_BUILDER_LAMBDA_LIMITS,
        copyFiles: (directory) =>
          fileSystemPromises.copyFile(
            join(FRONT_COMPONENT_BUILD_ASSETS_DIRECTORY, 'index.js'),
            join(directory, 'index.js'),
          ),
      });
    }
    const vendor = await this.getSharedDependencies({
      workspaceId,
      dependencies,
      handlerSource,
    });
    const sharedDependencies = {
      source: vendor.source,
      checksum: vendor.checksum,
      exportNamesBySpecifier: new Map(Object.entries(vendor.exports)),
    };
    const built = frontComponentBuildResultSchema.parse(
      await this.invoke({
        functionName,
        input: {
          action: 'buildComponent',
          input,
          manifest: { checksum: vendor.checksum, exports: vendor.exports },
        },
      }),
    );
    if (!built.success) {
      throw new FrontComponentException(
        built.error,
        FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
      );
    }
    if (
      createHash('sha256').update(built.compiledSource).digest('hex') !==
        built.checksum ||
      built.sharedDependenciesChecksum !== sharedDependencies.checksum ||
      readFrontComponentSharedDependenciesChecksum(built.compiledSource) !==
        sharedDependencies.checksum ||
      Buffer.byteLength(built.compiledSource) >
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
      compiledSource: built.compiledSource,
      checksum: built.checksum,
      sharedDependencies,
    };
  }

  private async getSharedDependencies({
    workspaceId,
    dependencies,
    handlerSource,
  }: {
    workspaceId: string;
    dependencies: Pick<
      Awaited<
        ReturnType<WorkspaceFrontComponentDependenciesService['readOrThrow']>
      >,
      'revision' | 'packageJson' | 'yarnLock'
    >;
    handlerSource: string;
  }) {
    const driver = this.getCurrentDriver();
    const yarnEngineFiles = await Promise.all(
      ['.yarnrc.yml', '.yarn/releases/yarn-4.9.2.cjs'].map((file) =>
        fileSystemPromises.readFile(join(YARN_ENGINE_DIRNAME, file), 'utf8'),
      ),
    );
    const functionName = computeHashedLambdaResourceName({
      resourceNamePrefix: 'twenty-front-component-vendor',
      namespace:
        driver.type === LogicFunctionDriverType.LAMBDA
          ? driver.options.resourceNamespace
          : 'local',
      contents: [
        workspaceId,
        handlerSource,
        ...yarnEngineFiles,
        String(FRONT_COMPONENT_VENDOR_LAMBDA_LIMITS.memoryMb),
        String(FRONT_COMPONENT_VENDOR_LAMBDA_LIMITS.timeoutSeconds),
        String(FRONT_COMPONENT_VENDOR_LAMBDA_LIMITS.ephemeralStorageMb),
      ],
    });
    const key = `ai-front-component-vendor:${driver.type === LogicFunctionDriverType.LOCAL ? 'local:' : ''}${functionName}:${dependencies.revision}`;
    return this.cacheLockService.withLock(
      async () => {
        const cached = await this.cacheStorage.get<unknown>(key);

        if (
          !isDefined(cached) &&
          driver.type === LogicFunctionDriverType.LAMBDA
        ) {
          await ensureFrontComponentLambdaExists({
            awsClient: driver.awsClient,
            toolFunctions: driver.toolFunctions,
            cacheLockService: this.cacheLockService,
            options: driver.options,
            functionName,
            limits: FRONT_COMPONENT_VENDOR_LAMBDA_LIMITS,
            copyFiles: async (directory) => {
              await Promise.all([
                fileSystemPromises.copyFile(
                  join(FRONT_COMPONENT_BUILD_ASSETS_DIRECTORY, 'index.js'),
                  join(directory, 'index.js'),
                ),
                fileSystemPromises.cp(
                  YARN_ENGINE_DIRNAME,
                  join(directory, 'yarn-engine'),
                  { recursive: true },
                ),
              ]);
            },
          });
        }
        const result = frontComponentVendorResultSchema.parse(
          cached ??
            (await this.invoke({
              functionName,
              input: {
                action: 'buildDependencies',
                packageJson: dependencies.packageJson,
                yarnLock: dependencies.yarnLock,
              },
            })),
        );
        if (!result.success) {
          throw new FrontComponentException(
            result.error,
            FrontComponentExceptionCode.INVALID_FRONT_COMPONENT_INPUT,
          );
        }
        if (
          createHash('sha256').update(result.source).digest('hex') !==
            result.checksum ||
          Buffer.byteLength(result.source) >
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
        ttl: (FRONT_COMPONENT_VENDOR_LAMBDA_LIMITS.timeoutSeconds + 60) * 1000,
        ms: BUILD_LOCK_RETRY_MS,
        maxRetries: BUILD_LOCK_MAX_RETRIES,
      },
    );
  }

  private async invoke({
    functionName,
    input,
  }: {
    functionName: string;
    input: FrontComponentBuilderRequest;
  }): Promise<unknown> {
    const driver = this.getCurrentDriver();
    const timeoutMs =
      (input.action === 'buildDependencies'
        ? FRONT_COMPONENT_VENDOR_LAMBDA_LIMITS.timeoutSeconds
        : FRONT_COMPONENT_BUILDER_LAMBDA_LIMITS.timeoutSeconds) * 1000;

    if (driver.type === LogicFunctionDriverType.LOCAL) {
      return invokeFrontComponentBuilderLocally({
        input,
        buildAssetsDirectory: FRONT_COMPONENT_BUILD_ASSETS_DIRECTORY,
        yarnEngineDirectory: YARN_ENGINE_DIRNAME,
        timeoutMs,
      });
    }
    const lambdaClient = await driver.awsClient.getLambdaClient();
    const result = await lambdaClient.send(
      new InvokeCommand({
        FunctionName: functionName,
        Payload: JSON.stringify(input),
      }),
      {
        abortSignal: AbortSignal.timeout(timeoutMs),
      },
    );
    if (result.FunctionError || !isDefined(result.Payload)) {
      throw new FrontComponentException(
        'Frontend component builder Lambda failed.',
        FrontComponentExceptionCode.FRONT_COMPONENT_CREATE_FAILED,
      );
    }
    return JSON.parse(result.Payload.transformToString());
  }
}

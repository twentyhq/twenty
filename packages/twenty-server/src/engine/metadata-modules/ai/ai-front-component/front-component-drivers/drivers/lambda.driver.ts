import { InvokeCommand } from '@aws-sdk/client-lambda';
import { cp } from 'fs/promises';
import { join } from 'path';
import { isDefined } from 'twenty-shared/utils';
import { YARN_ENGINE_DIRNAME } from 'src/engine/core-modules/application/application-package/constants/yarn-engine-dirname';
import { type CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import {
  BUILDER_LAMBDA_MEMORY_MB,
  BUILDER_LAMBDA_TIMEOUT_SECONDS,
  YARN_INSTALL_LAMBDA_MEMORY_MB,
  YARN_INSTALL_LAMBDA_TIMEOUT_SECONDS,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';
import { LambdaAwsClientService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-aws-client.service';
import { LambdaToolFunctionsService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-tool-functions.service';
import { type LambdaConnectionOptions } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/types/lambda-driver.type';
import { copyFrontComponentBuilder } from 'src/engine/metadata-modules/ai/ai-front-component/front-component-drivers/utils/copy-front-component-builder.util';
import { type FrontComponentDriver } from 'src/engine/metadata-modules/ai/ai-front-component/front-component-drivers/types/front-component-driver.type';
import { getFrontComponentBuilderName } from 'src/engine/metadata-modules/ai/ai-front-component/front-component-drivers/utils/get-front-component-builder-name.util';
import { frontComponentBuildResultSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-build-result.schema';
import { frontComponentDependenciesBuildResultSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-dependencies-build-result.schema';
import { type FrontComponentBuilderRequest } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-builder-request.type';
import {
  FrontComponentException,
  FrontComponentExceptionCode,
} from 'src/engine/metadata-modules/front-component/front-component.exception';

export class LambdaDriver implements FrontComponentDriver {
  private readonly awsClient: LambdaAwsClientService;
  private readonly toolFunctions: LambdaToolFunctionsService;

  constructor(
    private readonly options: LambdaConnectionOptions & {
      cacheLockService: CacheLockService;
      cacheStorageService: CacheStorageService;
    },
  ) {
    this.awsClient = new LambdaAwsClientService(options);
    this.toolFunctions = new LambdaToolFunctionsService(
      options,
      this.awsClient,
      options.cacheLockService,
    );
  }

  async getDependenciesBuildCacheKey(workspaceId: string) {
    const name = await getFrontComponentBuilderName({
      workspaceId,
      namespace: this.options.resourceNamespace,
      action: 'buildDependencies',
    });
    return `lambda:${name}`;
  }

  async transpile(request: Parameters<FrontComponentDriver['transpile']>[0]) {
    return frontComponentBuildResultSchema.parse(
      await this.invoke({ ...request, action: 'transpile' }),
    );
  }

  async buildDependencies(
    request: Parameters<FrontComponentDriver['buildDependencies']>[0],
  ) {
    return frontComponentDependenciesBuildResultSchema.parse(
      await this.invoke({ ...request, action: 'buildDependencies' }),
    );
  }

  private async invoke({
    workspaceId,
    ...input
  }: FrontComponentBuilderRequest & { workspaceId: string }): Promise<unknown> {
    const buildsDependencies = input.action === 'buildDependencies';
    const functionName = await getFrontComponentBuilderName({
      workspaceId,
      namespace: this.options.resourceNamespace,
      action: input.action,
    });
    const timeoutSeconds = buildsDependencies
      ? YARN_INSTALL_LAMBDA_TIMEOUT_SECONDS
      : BUILDER_LAMBDA_TIMEOUT_SECONDS;
    await this.toolFunctions.ensureToolLambdaExists({
      functionName,
      memoryMb: buildsDependencies
        ? YARN_INSTALL_LAMBDA_MEMORY_MB
        : BUILDER_LAMBDA_MEMORY_MB,
      timeoutSeconds,
      copyFiles: async (directory) => {
        await copyFrontComponentBuilder(directory);
        if (buildsDependencies) {
          await cp(YARN_ENGINE_DIRNAME, join(directory, 'yarn-engine'), {
            recursive: true,
          });
        }
      },
    });
    const lambdaClient = await this.awsClient.getLambdaClient();
    const result = await lambdaClient.send(
      new InvokeCommand({
        FunctionName: functionName,
        Payload: JSON.stringify(input),
      }),
      { abortSignal: AbortSignal.timeout(timeoutSeconds * 1000) },
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

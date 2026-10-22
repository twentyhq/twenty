import { FRONT_COMPONENT_MAX_BUILD_OUTPUT_BYTES } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-max-build-output-bytes.constant';
import { FRONT_COMPONENT_WRAPPER_NAME } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-wrapper-name.constant';
import { buildFrontComponentEntrySource } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component-entry-source.util';
import { frontComponentQuerySchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-query.schema';
import { readFrontComponentSharedDependenciesChecksum } from 'src/engine/metadata-modules/ai/ai-front-component/utils/read-front-component-shared-dependencies-checksum.util';
import { Injectable } from '@nestjs/common';
import { InvokeCommand } from '@aws-sdk/client-lambda';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { DriverFactoryBase } from 'src/engine/core-modules/twenty-config/dynamic-factory.base';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { ConfigGroupHashService } from 'src/engine/core-modules/twenty-config/services/config-group-hash.service';
import { ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';
import { LogicFunctionDriverType } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { LambdaAwsClientService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-aws-client.service';
import { LambdaToolFunctionsService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-tool-functions.service';
import { getLambdaConnectionOptions } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-connection-options.util';
import { computeHashedLambdaResourceName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/compute-hashed-lambda-resource-name.util';
import {
  BUILDER_LAMBDA_MEMORY_MB,
  BUILDER_LAMBDA_TIMEOUT_SECONDS,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';
import { FRONT_COMPONENT_BUILD_ASSETS_DIRECTORY } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-build-assets-directory.constant';
import { type FrontComponentBuildInput } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-build-input.type';
import { frontComponentBuildResultSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-build-result.schema';
import { getFrontComponentSharedDependencies } from 'src/engine/metadata-modules/ai/ai-front-component/utils/get-front-component-shared-dependencies.util';
import {
  FrontComponentException,
  FrontComponentExceptionCode,
} from 'src/engine/metadata-modules/front-component/front-component.exception';

@Injectable()
export class FrontComponentCompilerService extends DriverFactoryBase<{
  awsClient: LambdaAwsClientService;
  toolFunctions: LambdaToolFunctionsService;
  resourceNamespace: string;
}> {
  constructor(
    twentyConfigService: TwentyConfigService,
    configGroupHashService: ConfigGroupHashService,
  ) {
    super(twentyConfigService, configGroupHashService);
  }
  protected buildConfigKey(): string {
    return this.configGroupHashService.computeHash(
      ConfigVariablesGroup.LOGIC_FUNCTION_CONFIG,
    );
  }
  protected createDriver() {
    const options = getLambdaConnectionOptions(this.twentyConfigService);
    const awsClient = new LambdaAwsClientService(options);
    return {
      awsClient,
      toolFunctions: new LambdaToolFunctionsService(options, awsClient),
      resourceNamespace: options.resourceNamespace,
    };
  }
  async build(workspaceId: string, input: FrontComponentBuildInput) {
    if (
      this.twentyConfigService.get('LOGIC_FUNCTION_TYPE') !==
      LogicFunctionDriverType.LAMBDA
    ) {
      throw new FrontComponentException(
        'AI component compilation requires the Lambda logic-function driver.',
        FrontComponentExceptionCode.FRONT_COMPONENT_CREATE_FAILED,
      );
    }
    const source = buildFrontComponentEntrySource({
      ...input,
      query: frontComponentQuerySchema.parse(input.query),
    });
    const { awsClient, toolFunctions, resourceNamespace } =
      this.getCurrentDriver();
    const sharedDependencies = await getFrontComponentSharedDependencies();
    const handlerSource = await fs.readFile(
      join(FRONT_COMPONENT_BUILD_ASSETS_DIRECTORY, 'index.js'),
      'utf8',
    );
    const functionName = computeHashedLambdaResourceName({
      resourceNamePrefix: 'twenty-front-component-builder',
      namespace: resourceNamespace,
      contents: [
        workspaceId,
        handlerSource,
        sharedDependencies.checksum,
        String(BUILDER_LAMBDA_MEMORY_MB),
        String(BUILDER_LAMBDA_TIMEOUT_SECONDS),
      ],
    });
    await toolFunctions.ensureBuilderLambdaExists({
      functionName,
      copyFiles: async (directory) => {
        await Promise.all(
          ['index.js', 'shared-dependencies.json'].map((file) =>
            fs.copyFile(
              join(FRONT_COMPONENT_BUILD_ASSETS_DIRECTORY, file),
              join(directory, file),
            ),
          ),
        );
      },
    });
    const lambdaClient = await awsClient.getLambdaClient();
    const result = await lambdaClient.send(
      new InvokeCommand({
        FunctionName: functionName,
        Payload: JSON.stringify(input),
      }),
      {
        abortSignal: AbortSignal.timeout(BUILDER_LAMBDA_TIMEOUT_SECONDS * 1000),
      },
    );
    if (result.FunctionError || !result.Payload) {
      throw new FrontComponentException(
        'Frontend component builder Lambda failed.',
        FrontComponentExceptionCode.FRONT_COMPONENT_CREATE_FAILED,
      );
    }
    const built = frontComponentBuildResultSchema.parse(
      JSON.parse(result.Payload.transformToString()),
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
      componentName: FRONT_COMPONENT_WRAPPER_NAME,
      compiledSource: built.compiledSource,
      checksum: built.checksum,
      sharedDependencies,
    };
  }
}

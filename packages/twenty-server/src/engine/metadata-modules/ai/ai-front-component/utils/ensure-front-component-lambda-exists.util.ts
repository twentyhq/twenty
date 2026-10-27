import { promises as fs } from 'fs';

import {
  CreateFunctionCommand,
  ResourceConflictException,
} from '@aws-sdk/client-lambda';
import { isDefined } from 'twenty-shared/utils';

import { type LambdaAwsClientService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-aws-client.service';
import { type LambdaToolFunctionsService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-tool-functions.service';
import { type LambdaConnectionOptions } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/types/lambda-driver.type';
import { createZipFile } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/create-zip-file';
import { TemporaryDirManager } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/temporary-dir-manager';
import { type FrontComponentLambdaLimits } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-lambda-limits.type';
import { LogicFunctionRuntime } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

export const ensureFrontComponentLambdaExists = async ({
  awsClient,
  toolFunctions,
  options,
  functionName,
  limits,
  copyFiles,
}: {
  awsClient: LambdaAwsClientService;
  toolFunctions: LambdaToolFunctionsService;
  options: Pick<LambdaConnectionOptions, 'lambdaRole' | 'resourceTags'>;
  functionName: string;
  limits: FrontComponentLambdaLimits;
  copyFiles: (directory: string) => Promise<void>;
}): Promise<void> => {
  const existingFunction = await awsClient.getFunction(functionName);

  if (isDefined(existingFunction)) {
    if (existingFunction.Configuration?.State !== 'Active') {
      await awsClient.waitFunctionActive(functionName);
    }

    return;
  }

  const commonLayerArn = await toolFunctions.ensureCommonLayerExists();

  const temporaryDirManager = new TemporaryDirManager();
  const { sourceTemporaryDir, lambdaZipPath } =
    await temporaryDirManager.init();

  try {
    await copyFiles(sourceTemporaryDir);

    await createZipFile(sourceTemporaryDir, lambdaZipPath);

    const lambdaClient = await awsClient.getLambdaClient();

    try {
      await lambdaClient.send(
        new CreateFunctionCommand({
          Code: { ZipFile: await fs.readFile(lambdaZipPath) },
          FunctionName: functionName,
          Layers: [commonLayerArn],
          Handler: 'index.handler',
          Role: options.lambdaRole,
          Tags: options.resourceTags,
          Runtime: LogicFunctionRuntime.NODE22,
          Timeout: limits.timeoutSeconds,
          MemorySize: limits.memoryMb,
          EphemeralStorage: { Size: limits.ephemeralStorageMb },
        }),
      );
    } catch (error) {
      if (!(error instanceof ResourceConflictException)) {
        throw error;
      }
    }
  } finally {
    await temporaryDirManager.clean();
  }

  await awsClient.waitFunctionActive(functionName);
};

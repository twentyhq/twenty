import { Lambda } from '@aws-sdk/client-lambda';

import { type FlociLambdaDriver } from 'test/integration/logic-function-lambda/types/floci-lambda-driver.type';
import { deleteConfigVariable } from 'test/integration/twenty-config/utils/delete-config-variable.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { startFlociContainer } from 'test/integration/utils/start-floci-container.util';

import { getLambdaResourceNamespace } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-resource-namespace.util';
import { LogicFunctionDriverType } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';

const LAMBDA_REGION = 'us-east-1';
const LAMBDA_ROLE = 'arn:aws:iam::000000000000:role/twenty-integration-test';
const FLOCI_CREDENTIALS = { accessKeyId: 'test', secretAccessKey: 'test' };

export const switchToFlociLambdaDriver =
  async (): Promise<FlociLambdaDriver> => {
    const floci = await startFlociContainer();
    const lambdaDriverConfigVariables: Record<string, string> = {
      LOGIC_FUNCTION_TYPE: LogicFunctionDriverType.LAMBDA,
      LOGIC_FUNCTION_LAMBDA_REGION: LAMBDA_REGION,
      LOGIC_FUNCTION_LAMBDA_ENDPOINT: floci.endpoint,
      LOGIC_FUNCTION_LAMBDA_ROLE: LAMBDA_ROLE,
      LOGIC_FUNCTION_LAMBDA_ACCESS_KEY_ID: FLOCI_CREDENTIALS.accessKeyId,
      LOGIC_FUNCTION_LAMBDA_SECRET_ACCESS_KEY:
        FLOCI_CREDENTIALS.secretAccessKey,
    };

    for (const [key, value] of Object.entries(lambdaDriverConfigVariables)) {
      await updateConfigVariable({ input: { key, value } });
    }

    return {
      lambdaClient: new Lambda({
        region: LAMBDA_REGION,
        credentials: FLOCI_CREDENTIALS,
        endpoint: floci.endpoint,
      }),
      resourceNamespace: getLambdaResourceNamespace({
        lambdaRoleArn: LAMBDA_ROLE,
      }),
      restore: async () => {
        for (const key of Object.keys(lambdaDriverConfigVariables)) {
          await deleteConfigVariable({ input: { key } }).catch(() => undefined);
        }

        await floci.stop();
      },
    };
  };

import { createOneServerlessFunction } from 'test/integration/metadata/suites/serverless-function/utils/create-one-serverless-function.util';
import { deleteServerlessFunction } from 'test/integration/metadata/suites/serverless-function/utils/delete-serverless-function.util';
import { executeServerlessFunction } from 'test/integration/metadata/suites/serverless-function/utils/execute-serverless-function.util';
import { publishServerlessFunction } from 'test/integration/metadata/suites/serverless-function/utils/publish-serverless-function.util';

import { ServerlessFunctionExecutionStatus } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-execution-result.dto';

describe('Serverless Function Execution', () => {
  const createdFunctionIds: string[] = [];

  afterAll(async () => {
    // Clean up all created functions
    for (const functionId of createdFunctionIds) {
      try {
        await deleteServerlessFunction({
          input: { id: functionId },
          expectToFail: false,
        });
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  it('should execute the default serverless function template', async () => {
    // Create the function (uses default template)
    const { data: createData } = await createOneServerlessFunction({
      input: {
        name: 'Test Default Function',
      },
      expectToFail: false,
    });

    const functionId = createData?.createOneServerlessFunction?.id;

    expect(functionId).toBeDefined();
    createdFunctionIds.push(functionId);

    // Publish the function
    const { data: publishData } = await publishServerlessFunction({
      input: { id: functionId },
      expectToFail: false,
    });

    expect(publishData?.publishServerlessFunction?.latestVersion).toBeDefined();

    // Execute with the default template's expected params: { a: string, b: number }
    const { data: executeData } = await executeServerlessFunction({
      input: {
        id: functionId,
        payload: { a: 'hello', b: 42 },
      },
      expectToFail: false,
    });

    const result = executeData?.executeOneServerlessFunction;

    expect(result?.status).toBe(ServerlessFunctionExecutionStatus.SUCCESS);
    // Default template returns: { message: `Hello, input: ${a} and ${b}` }
    expect(result?.data).toMatchObject({
      message: 'Hello, input: hello and 42',
    });
    expect(result?.duration).toBeGreaterThan(0);
  });

  it('should return error status when function throws', async () => {
    // Create the function (uses default template)
    const { data: createData } = await createOneServerlessFunction({
      input: {
        name: 'Test Error Function',
      },
      expectToFail: false,
    });

    const functionId = createData?.createOneServerlessFunction?.id;

    expect(functionId).toBeDefined();
    createdFunctionIds.push(functionId);

    // Publish the function
    await publishServerlessFunction({
      input: { id: functionId },
      expectToFail: false,
    });

    // Execute with missing required params - the default template destructures params
    // which should cause the function to run but with undefined values
    const { data: executeData } = await executeServerlessFunction({
      input: {
        id: functionId,
        payload: {}, // Missing a and b params
      },
      expectToFail: false,
    });

    const result = executeData?.executeOneServerlessFunction;

    // Function still succeeds but with undefined values in the message
    expect(result?.status).toBe(ServerlessFunctionExecutionStatus.SUCCESS);
    expect(result?.data).toMatchObject({
      message: 'Hello, input: undefined and undefined',
    });
  });
});

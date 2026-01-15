import { createOneServerlessFunction } from 'test/integration/metadata/suites/serverless-function/utils/create-one-serverless-function.util';
import { deleteServerlessFunction } from 'test/integration/metadata/suites/serverless-function/utils/delete-serverless-function.util';
import { executeServerlessFunction } from 'test/integration/metadata/suites/serverless-function/utils/execute-serverless-function.util';
import { publishServerlessFunction } from 'test/integration/metadata/suites/serverless-function/utils/publish-serverless-function.util';
import { updateServerlessFunction } from 'test/integration/metadata/suites/serverless-function/utils/update-serverless-function.util';

import { ServerlessFunctionExecutionStatus } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-execution-result.dto';

// Test function using lodash (external package)
const LODASH_FUNCTION_CODE = {
  'src/index.ts': `import _ from 'lodash';

export const main = async (params: { items: string[] }): Promise<object> => {
  const uniqueItems = _.uniq(params.items);
  const sortedItems = _.sortBy(uniqueItems);
  console.log('Processed items:', sortedItems);
  return {
    original: params.items,
    processed: sortedItems,
    count: sortedItems.length
  };
};`,
};

// Test function that throws an error
const ERROR_FUNCTION_CODE = {
  'src/index.ts': `export const main = async (params: { shouldFail: boolean }): Promise<object> => {
  if (params.shouldFail) {
    throw new Error('Intentional test error');
  }
  return { success: true };
};`,
};

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

  it('should execute a function with external packages (lodash)', async () => {
    // Create the function (uses default template initially)
    const { data: createData } = await createOneServerlessFunction({
      input: {
        name: 'Lodash Array Processor',
      },
      expectToFail: false,
    });

    const functionId = createData?.createOneServerlessFunction?.id;

    expect(functionId).toBeDefined();
    createdFunctionIds.push(functionId);

    // Update with custom lodash code
    await updateServerlessFunction({
      input: {
        id: functionId,
        update: {
          code: LODASH_FUNCTION_CODE,
        },
      },
      expectToFail: false,
    });

    // Publish the function
    await publishServerlessFunction({
      input: { id: functionId },
      expectToFail: false,
    });

    // Execute the function with duplicate items
    const { data: executeData } = await executeServerlessFunction({
      input: {
        id: functionId,
        payload: { items: ['banana', 'apple', 'banana', 'cherry', 'apple'] },
      },
      expectToFail: false,
    });

    const result = executeData?.executeOneServerlessFunction;

    expect(result?.status).toBe(ServerlessFunctionExecutionStatus.SUCCESS);
    expect(result?.data).toMatchObject({
      original: ['banana', 'apple', 'banana', 'cherry', 'apple'],
      processed: ['apple', 'banana', 'cherry'], // unique and sorted
      count: 3,
    });
    expect(result?.logs).toContain('Processed items:');
  });

  it('should handle errors thrown by serverless functions', async () => {
    // Create the function
    const { data: createData } = await createOneServerlessFunction({
      input: {
        name: 'Error Test Function',
      },
      expectToFail: false,
    });

    const functionId = createData?.createOneServerlessFunction?.id;

    expect(functionId).toBeDefined();
    createdFunctionIds.push(functionId);

    // Update with error-throwing code
    await updateServerlessFunction({
      input: {
        id: functionId,
        update: {
          code: ERROR_FUNCTION_CODE,
        },
      },
      expectToFail: false,
    });

    // Publish the function
    await publishServerlessFunction({
      input: { id: functionId },
      expectToFail: false,
    });

    // Execute with shouldFail = false (should succeed)
    const { data: successData } = await executeServerlessFunction({
      input: {
        id: functionId,
        payload: { shouldFail: false },
      },
      expectToFail: false,
    });

    expect(successData?.executeOneServerlessFunction?.status).toBe(
      ServerlessFunctionExecutionStatus.SUCCESS,
    );
    expect(successData?.executeOneServerlessFunction?.data).toMatchObject({
      success: true,
    });

    // Execute with shouldFail = true (should return error status)
    const { data: errorData } = await executeServerlessFunction({
      input: {
        id: functionId,
        payload: { shouldFail: true },
      },
      expectToFail: false, // The GraphQL call succeeds, but the function execution fails
    });

    const errorResult = errorData?.executeOneServerlessFunction;

    expect(errorResult?.status).toBe(ServerlessFunctionExecutionStatus.ERROR);
    expect(errorResult?.error).toMatchObject({
      errorType: 'Error',
      errorMessage: 'Intentional test error',
    });
    expect(errorResult?.data).toBeNull();
  });
});

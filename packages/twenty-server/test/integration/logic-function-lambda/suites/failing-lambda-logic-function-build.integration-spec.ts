import { randomUUID } from 'crypto';

import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { type FlociLambdaDriver } from 'test/integration/logic-function-lambda/types/floci-lambda-driver.type';
import { publishDependencyLayerFixture } from 'test/integration/logic-function-lambda/utils/publish-dependency-layer-fixture.util';
import { switchToFlociLambdaDriver } from 'test/integration/logic-function-lambda/utils/switch-to-floci-lambda-driver.util';
import { createOneLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/create-logic-function.util';
import { deleteLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/delete-logic-function.util';
import { executeLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/execute-logic-function.util';
import { updateLogicFunctionSource } from 'test/integration/metadata/suites/logic-function/utils/update-logic-function-source.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const LAMBDA_TEST_TIMEOUT_MS = 300_000;

const IMPORTED_FILE_DIRECTORY = 'opt/nodejs/node_modules/esbuild';
const PARENT_DIRECTORIES = '../'.repeat(10);

const WORK_DIRECTORY_PATTERN = /[0-9a-f]{32}/g;
const LOGIC_FUNCTION_ID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;

const maskBuildPaths = (message: string) =>
  message
    .replace(LOGIC_FUNCTION_ID_PATTERN, '<logicFunctionId>')
    .replace(WORK_DIRECTORY_PATTERN, '<workDirectory>');

type TestContext = {
  sourceHandlerCode: string;
};

const FAILING_BUILD_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'through an absolute path',
    context: {
      sourceHandlerCode: `import packageJson from '/${IMPORTED_FILE_DIRECTORY}/package.json';

export const main = async (): Promise<object> => packageJson;`,
    },
  },
  {
    title: 'through a relative path',
    context: {
      sourceHandlerCode: `import packageJson from '${PARENT_DIRECTORIES}${IMPORTED_FILE_DIRECTORY}/package.json';

export const main = async (): Promise<object> => packageJson;`,
    },
  },
  {
    title: 'through a glob import',
    context: {
      sourceHandlerCode: `export const main = async (params: { extension: string }): Promise<object> =>
  import(\`${PARENT_DIRECTORIES}${IMPORTED_FILE_DIRECTORY}/package.\${params.extension}\`);`,
    },
  },
];

describe('Building a logic function on the Lambda driver should fail', () => {
  let flociLambdaDriver: FlociLambdaDriver;
  const createdLogicFunctionIds: string[] = [];

  beforeAll(async () => {
    flociLambdaDriver = await switchToFlociLambdaDriver();

    await publishDependencyLayerFixture({
      lambdaClient: flociLambdaDriver.lambdaClient,
      resourceNamespace: flociLambdaDriver.resourceNamespace,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });
  }, LAMBDA_TEST_TIMEOUT_MS);

  afterAll(async () => {
    for (const logicFunctionId of createdLogicFunctionIds) {
      await deleteLogicFunction({
        input: { id: logicFunctionId },
        expectToFail: false,
      }).catch(() => undefined);
    }

    await waitForAllJobsToFinish();
    await flociLambdaDriver?.restore();
  }, LAMBDA_TEST_TIMEOUT_MS);

  it.each(eachTestingContextFilter(FAILING_BUILD_TEST_CASES))(
    'when its source imports a file $title',
    async ({ context }) => {
      const { data } = await createOneLogicFunction({
        input: { name: `Lambda build ${randomUUID()}` },
        expectToFail: false,
      });
      const logicFunctionId: string = data.createOneLogicFunction.id;

      createdLogicFunctionIds.push(logicFunctionId);

      await updateLogicFunctionSource({
        input: {
          id: logicFunctionId,
          update: { sourceHandlerCode: context.sourceHandlerCode },
        },
        expectToFail: false,
      });

      const { errors } = await executeLogicFunction({
        input: { id: logicFunctionId, payload: { extension: 'json' } },
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
        normalizeMessage: maskBuildPaths,
      });
    },
    LAMBDA_TEST_TIMEOUT_MS,
  );
});

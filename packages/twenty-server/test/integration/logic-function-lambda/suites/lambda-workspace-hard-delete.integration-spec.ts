import { randomUUID } from 'crypto';

import { ResourceNotFoundException } from '@aws-sdk/client-lambda';
import { activateWorkspace } from 'test/integration/graphql/utils/activate-workspace.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { type FlociLambdaDriver } from 'test/integration/logic-function-lambda/types/floci-lambda-driver.type';
import { getWorkspaceCustomFlatApplication } from 'test/integration/logic-function-lambda/utils/get-workspace-custom-flat-application.util';
import { publishDependencyLayerFixture } from 'test/integration/logic-function-lambda/utils/publish-dependency-layer-fixture.util';
import { switchToFlociLambdaDriver } from 'test/integration/logic-function-lambda/utils/switch-to-floci-lambda-driver.util';
import { createOneLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/create-logic-function.util';
import { executeLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/execute-logic-function.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { isDefined } from 'twenty-shared/utils';

import { getLambdaSdkLayerName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-sdk-layer-name.util';
import { type SdkClientGenerationService } from 'src/engine/core-modules/sdk-client/sdk-client-generation.service';
import { type WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';

const LAMBDA_TEST_TIMEOUT_MS = 300_000;

describe('Workspace hard delete on the Lambda driver (integration)', () => {
  let flociLambdaDriver: FlociLambdaDriver;
  let userAccessToken: string | undefined;
  let workspaceIdToCleanup: string | undefined;

  const createActiveWorkspace = async () => {
    const email = `lambda-hard-delete-${randomUUID()}@example.com`;
    const { data: signUpData } = await signUp({
      input: { email, password: 'Test123!@#' },
      expectToFail: false,
    });

    userAccessToken =
      signUpData.signUp.tokens.accessOrWorkspaceAgnosticToken.token;

    await globalThis.testDataSource.query(
      'UPDATE core."user" SET "isEmailVerified" = true WHERE email = $1',
      [email],
    );

    const {
      data: { signUpInNewWorkspace: newWorkspaceData },
    } = await signUpInNewWorkspace({
      accessToken: userAccessToken,
      expectToFail: false,
    });
    const workspaceId: string = newWorkspaceData.workspace.id;

    workspaceIdToCleanup = workspaceId;

    const {
      data: { getAuthTokensFromLoginToken: authTokensData },
    } = await getAuthTokensFromLoginToken({
      origin: newWorkspaceData.workspace.workspaceUrls.subdomainUrl,
      loginToken: newWorkspaceData.loginToken.token,
      expectToFail: false,
    });
    const workspaceAccessToken: string =
      authTokensData.tokens.accessOrWorkspaceAgnosticToken.token;

    await activateWorkspace({
      accessToken: workspaceAccessToken,
      expectToFail: false,
    });

    return { workspaceId, workspaceAccessToken };
  };

  beforeAll(async () => {
    flociLambdaDriver = await switchToFlociLambdaDriver();
  }, LAMBDA_TEST_TIMEOUT_MS);

  afterAll(async () => {
    if (isDefined(workspaceIdToCleanup)) {
      const [remainingWorkspace] = await globalThis.testDataSource.query(
        'SELECT id FROM core."workspace" WHERE id = $1',
        [workspaceIdToCleanup],
      );

      if (isDefined(remainingWorkspace)) {
        await getAppProviderByClassName<WorkspaceService>('WorkspaceService')
          .deleteWorkspace(workspaceIdToCleanup)
          .catch(() => undefined);
      }
    }

    if (isDefined(userAccessToken)) {
      await deleteUser({ accessToken: userAccessToken }).catch(() => undefined);
    }

    await waitForAllJobsToFinish();
    await flociLambdaDriver?.restore();
  }, LAMBDA_TEST_TIMEOUT_MS);

  it(
    'removes the Lambda functions and SDK layer of a hard deleted workspace',
    async () => {
      const { lambdaClient, resourceNamespace } = flociLambdaDriver;
      const { workspaceId, workspaceAccessToken } =
        await createActiveWorkspace();
      const customFlatApplication =
        await getWorkspaceCustomFlatApplication(workspaceId);

      await getAppProviderByClassName<SdkClientGenerationService>(
        'SdkClientGenerationService',
      ).generateSdkClientForApplication({
        workspaceId,
        applicationId: customFlatApplication.id,
        applicationUniversalIdentifier:
          customFlatApplication.universalIdentifier,
      });
      await publishDependencyLayerFixture({
        lambdaClient,
        resourceNamespace,
        workspaceId,
      });

      const { data } = await createOneLogicFunction({
        input: { name: `Lambda hard delete ${randomUUID()}` },
        expectToFail: false,
        token: workspaceAccessToken,
      });
      const logicFunctionId: string = data.createOneLogicFunction.id;

      const { data: executionData } = await executeLogicFunction({
        input: { id: logicFunctionId, payload: { a: 'before', b: 'delete' } },
        expectToFail: false,
        token: workspaceAccessToken,
      });

      expect(executionData.executeOneLogicFunction.status).toBe(
        LogicFunctionExecutionStatus.SUCCESS,
      );

      const sdkLayerName = getLambdaSdkLayerName({
        workspaceId,
        applicationUniversalIdentifier:
          customFlatApplication.universalIdentifier,
      });
      const { LayerVersions: sdkLayerVersionsBeforeDelete } =
        await lambdaClient.listLayerVersions({ LayerName: sdkLayerName });

      expect(sdkLayerVersionsBeforeDelete).not.toHaveLength(0);

      const workspaceService =
        getAppProviderByClassName<WorkspaceService>('WorkspaceService');

      await workspaceService.deleteWorkspace(workspaceId, true);
      await waitForAllJobsToFinish();
      await workspaceService.deleteWorkspace(workspaceId);
      await waitForAllJobsToFinish();

      await expect(
        lambdaClient.getFunction({ FunctionName: logicFunctionId }),
      ).rejects.toThrow(ResourceNotFoundException);

      const { LayerVersions: sdkLayerVersionsAfterDelete } =
        await lambdaClient.listLayerVersions({ LayerName: sdkLayerName });

      expect(sdkLayerVersionsAfterDelete ?? []).toHaveLength(0);
    },
    LAMBDA_TEST_TIMEOUT_MS,
  );
});

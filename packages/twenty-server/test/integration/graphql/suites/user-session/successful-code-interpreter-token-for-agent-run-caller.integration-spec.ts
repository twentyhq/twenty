import { captureAgentRunExecution } from 'test/integration/graphql/suites/user-session/utils/capture-agent-run-execution.util';
import { captureCodeInterpreterSandboxToken } from 'test/integration/graphql/suites/user-session/utils/capture-code-interpreter-sandbox-token.util';
import { currentUser } from 'test/integration/graphql/suites/user-session/utils/current-user.util';
import { pingMcp } from 'test/integration/graphql/suites/user-session/utils/ping-mcp.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithResources,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { isDefined } from 'twenty-shared/utils';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

type GlobalTestContext = {
  agentUniversalIdentifier: string;
  applicationRoleId: string;
  applicationToken: string;
};

const captureSandboxTokenForAgentRun = async ({
  globalTestContext,
  token,
}: {
  globalTestContext: GlobalTestContext;
  token: string;
}) =>
  captureCodeInterpreterSandboxToken({
    authContext: (
      await captureAgentRunExecution({
        agentUniversalIdentifier: globalTestContext.agentUniversalIdentifier,
        token,
      })
    ).executionContext.authContext,
    roleId: globalTestContext.applicationRoleId,
  });

describe('Code interpreter sandbox token for an agent run should follow the caller', () => {
  let application: ApplicationWithResources;
  let globalTestContext: GlobalTestContext;

  beforeAll(async () => {
    application = await setupApplicationWithResources({
      name: 'Agent Run Caller Probe',
    });

    const [{ universalIdentifier: agentUniversalIdentifier }] =
      await globalThis.testDataSource.query(
        `SELECT "universalIdentifier" FROM core."agent" WHERE id = $1`,
        [application.agentId],
      );

    const [{ defaultRoleId: applicationRoleId }] =
      await globalThis.testDataSource.query(
        `SELECT "defaultRoleId" FROM core."application" WHERE id = $1`,
        [application.id],
      );

    const { applicationAccessToken } = await generateApplicationTokenPair({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId: application.id,
    });

    globalTestContext = {
      agentUniversalIdentifier,
      applicationRoleId,
      applicationToken: applicationAccessToken.token,
    };
  }, 120000);

  afterAll(async () => {
    if (!isDefined(application)) {
      return;
    }

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: application.universalIdentifier,
    });
  });

  it('should bind the sandbox to the member who runs another application agent', async () => {
    const sandboxToken = await captureSandboxTokenForAgentRun({
      globalTestContext,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    if (!isDefined(sandboxToken)) {
      throw new Error('Expected the sandbox to receive a token');
    }

    const { data } = await currentUser({
      gqlFields: 'id',
      token: sandboxToken,
      expectToFail: false,
    });

    expect(data.currentUser.id).toBe(USER_DATA_SEED_IDS.JONY);
  });

  it('should hand the sandbox no token when an API key runs an application agent', async () => {
    const sandboxToken = await captureSandboxTokenForAgentRun({
      globalTestContext,
      token: API_KEY_ACCESS_TOKEN,
    });

    expect(sandboxToken).toBeUndefined();
  });

  it('should still hand the sandbox a working token when the application runs its own agent', async () => {
    const sandboxToken = await captureSandboxTokenForAgentRun({
      globalTestContext,
      token: globalTestContext.applicationToken,
    });

    if (!isDefined(sandboxToken)) {
      throw new Error('Expected the sandbox to receive a token');
    }

    const { status, body } = await pingMcp({ token: sandboxToken });

    expect(status).toBe(200);
    expect(body.result).toEqual({});
  });
});

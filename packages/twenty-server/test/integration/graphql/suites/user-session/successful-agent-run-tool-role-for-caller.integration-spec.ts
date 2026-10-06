import { captureAgentRunExecution } from 'test/integration/graphql/suites/user-session/utils/capture-agent-run-execution.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithResources,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { isDefined } from 'twenty-shared/utils';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

type GlobalTestContext = {
  agentUniversalIdentifier: string;
  applicationToken: string;
  janeApplicationToken: string;
};

type TestContext = {
  token: (globalContext: GlobalTestContext) => string;
  userWorkspaceId: string;
};

const memberRunTestCases: EachTestingContext<TestContext>[] = [
  {
    title: 'a member session runs another application agent',
    context: {
      token: () => APPLE_JONY_MEMBER_ACCESS_TOKEN,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
    },
  },
  {
    title: 'an application token issued for a member runs its own agent',
    context: {
      token: (globalContext) => globalContext.janeApplicationToken,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
    },
  },
];

const findUserWorkspaceRoleId = async (
  userWorkspaceId: string,
): Promise<string> => {
  const [{ roleId }] = await globalThis.testDataSource.query(
    `SELECT "roleId" FROM core."roleTarget"
     WHERE "userWorkspaceId" = $1 AND "workspaceId" = $2`,
    [userWorkspaceId, SEED_APPLE_WORKSPACE_ID],
  );

  return roleId;
};

describe('Agent run tools should be limited to the caller role', () => {
  let application: ApplicationWithResources;
  let globalTestContext: GlobalTestContext;

  beforeAll(async () => {
    application = await setupApplicationWithResources({
      name: 'Agent Run Tool Role Probe',
    });

    const [{ universalIdentifier: agentUniversalIdentifier }] =
      await globalThis.testDataSource.query(
        `SELECT "universalIdentifier" FROM core."agent" WHERE id = $1`,
        [application.agentId],
      );

    const [applicationTokenPair, janeApplicationTokenPair] = await Promise.all([
      generateApplicationTokenPair({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationId: application.id,
      }),
      generateAppleAdminApplicationTokenPair({
        applicationId: application.id,
      }),
    ]);

    globalTestContext = {
      agentUniversalIdentifier,
      applicationToken: applicationTokenPair.applicationAccessToken.token,
      janeApplicationToken:
        janeApplicationTokenPair.applicationAccessToken.token,
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

  it.each(eachTestingContextFilter(memberRunTestCases))(
    'should restrict the agent role to the member role when $title',
    async ({ context }) => {
      const { executionContext } = await captureAgentRunExecution({
        agentUniversalIdentifier: globalTestContext.agentUniversalIdentifier,
        token: context.token(globalTestContext),
      });

      expect(executionContext.runAsRoleId).toBeUndefined();
      expect(executionContext.additionalRoleRestrictionIds).toEqual([
        await findUserWorkspaceRoleId(context.userWorkspaceId),
      ]);
    },
  );

  it('should keep the agent role alone when the application runs its own agent', async () => {
    const { executionContext } = await captureAgentRunExecution({
      agentUniversalIdentifier: globalTestContext.agentUniversalIdentifier,
      token: globalTestContext.applicationToken,
    });

    expect(executionContext.runAsRoleId).toBeUndefined();
    expect(executionContext.additionalRoleRestrictionIds).toBeUndefined();
  });
});

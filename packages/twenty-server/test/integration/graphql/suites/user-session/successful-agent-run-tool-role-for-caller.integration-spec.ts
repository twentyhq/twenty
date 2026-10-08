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
import { API_KEY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/api-key-data-seeds.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

type GlobalTestContext = {
  agentUniversalIdentifier: string;
  applicationRoleId: string;
  applicationToken: string;
  janeApplicationToken: string;
};

type TestContext = {
  token: (globalContext: GlobalTestContext) => string;
  runAsWorkspaceMemberId?: string;
  roleTargetId: string;
};

const callerRunTestCases: EachTestingContext<TestContext>[] = [
  {
    title: 'a member session runs another application agent',
    context: {
      token: () => APPLE_JONY_MEMBER_ACCESS_TOKEN,
      roleTargetId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
    },
  },
  {
    title: 'an application token issued for a member runs its own agent',
    context: {
      token: (globalContext) => globalContext.janeApplicationToken,
      roleTargetId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
    },
  },
  {
    title: 'the application runs its agent as a member',
    context: {
      token: (globalContext) => globalContext.applicationToken,
      runAsWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      roleTargetId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
    },
  },
  {
    title: 'an API key runs an application agent',
    context: {
      token: () => API_KEY_ACCESS_TOKEN,
      roleTargetId: API_KEY_DATA_SEED_IDS.ID_1,
    },
  },
];

const findCallerRoleId = async (roleTargetId: string): Promise<string> => {
  const [{ roleId }] = await globalThis.testDataSource.query(
    `SELECT "roleId" FROM core."roleTarget"
     WHERE $1 IN ("userWorkspaceId", "apiKeyId") AND "workspaceId" = $2`,
    [roleTargetId, SEED_APPLE_WORKSPACE_ID],
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

    const [{ defaultRoleId: applicationRoleId }] =
      await globalThis.testDataSource.query(
        `SELECT "defaultRoleId" FROM core."application" WHERE id = $1`,
        [application.id],
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
      applicationRoleId,
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

  it.each(eachTestingContextFilter(callerRunTestCases))(
    'should restrict the agent role to the caller and application roles when $title',
    async ({ context }) => {
      const { executionContext } = await captureAgentRunExecution({
        agentUniversalIdentifier: globalTestContext.agentUniversalIdentifier,
        token: context.token(globalTestContext),
        runAsWorkspaceMemberId: context.runAsWorkspaceMemberId,
      });

      expect(executionContext.additionalRoleRestrictionIds).toEqual([
        await findCallerRoleId(context.roleTargetId),
        globalTestContext.applicationRoleId,
      ]);
    },
  );

  it('should restrict the agent role to the application role when the application runs its own agent', async () => {
    const { executionContext } = await captureAgentRunExecution({
      agentUniversalIdentifier: globalTestContext.agentUniversalIdentifier,
      token: globalTestContext.applicationToken,
    });

    expect(executionContext.additionalRoleRestrictionIds).toEqual([
      globalTestContext.applicationRoleId,
    ]);
  });
});

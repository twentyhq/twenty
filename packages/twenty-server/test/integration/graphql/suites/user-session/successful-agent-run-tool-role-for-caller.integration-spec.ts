import { type PermissionsMainPrincipal } from 'src/engine/permissions/principal/types/permissions-principals-context.type';
import { getPermissionsPrincipalsFromAuthContext } from 'src/engine/permissions/principal/utils/get-permissions-principals-from-auth-context.util';
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
import { API_KEY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/api-key-data-seeds.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

type GlobalTestContext = {
  agentUniversalIdentifier: string;
  applicationToken: string;
  janeApplicationToken: string;
};

type TestContext = {
  token: (globalContext: GlobalTestContext) => string;
  runAsWorkspaceMemberId?: string;
  mainPrincipal: PermissionsMainPrincipal;
};

const callerRunTestCases: EachTestingContext<TestContext>[] = [
  {
    title: 'a member session runs another application agent',
    context: {
      token: () => APPLE_JONY_MEMBER_ACCESS_TOKEN,
      mainPrincipal: {
        type: 'workspaceMember',
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
    },
  },
  {
    title: 'an application token issued for a member runs its own agent',
    context: {
      token: (globalContext) => globalContext.janeApplicationToken,
      mainPrincipal: {
        type: 'workspaceMember',
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      },
    },
  },
  {
    title: 'the application runs its agent as a member',
    context: {
      token: (globalContext) => globalContext.applicationToken,
      runAsWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      mainPrincipal: {
        type: 'workspaceMember',
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
    },
  },
  {
    title: 'an API key runs an application agent',
    context: {
      token: () => API_KEY_ACCESS_TOKEN,
      mainPrincipal: { type: 'apiKey', apiKeyId: API_KEY_DATA_SEED_IDS.ID_1 },
    },
  },
];

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

  it.each(eachTestingContextFilter(callerRunTestCases))(
    'should restrict the agent role to the caller and the agent application when $title',
    async ({ context }) => {
      const { executionContext } = await captureAgentRunExecution({
        agentUniversalIdentifier: globalTestContext.agentUniversalIdentifier,
        token: context.token(globalTestContext),
        runAsWorkspaceMemberId: context.runAsWorkspaceMemberId,
      });

      expect(
        getPermissionsPrincipalsFromAuthContext(executionContext.authContext),
      ).toEqual({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        mainPrincipal: context.mainPrincipal,
        limitingPrincipal: { type: 'agent', agentId: application.agentId },
        applicationPrincipal: {
          type: 'application',
          applicationId: application.id,
        },
      });
    },
  );

  it('should restrict the agent role to the application role when the application runs its own agent', async () => {
    const { executionContext } = await captureAgentRunExecution({
      agentUniversalIdentifier: globalTestContext.agentUniversalIdentifier,
      token: globalTestContext.applicationToken,
    });

    expect(
      getPermissionsPrincipalsFromAuthContext(executionContext.authContext),
    ).toEqual({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      mainPrincipal: { type: 'application', applicationId: application.id },
      limitingPrincipal: { type: 'agent', agentId: application.agentId },
      applicationPrincipal: {
        type: 'application',
        applicationId: application.id,
      },
    });
  });
});

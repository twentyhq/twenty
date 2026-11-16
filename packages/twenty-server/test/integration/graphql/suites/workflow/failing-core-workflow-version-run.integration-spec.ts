import { randomUUID } from 'node:crypto';

import {
  createCoreWorkflow,
  deleteCoreWorkflows,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { createManualCoreWorkflowDraft } from 'test/integration/graphql/suites/workflow/utils/create-manual-core-workflow-draft.util';
import { runCoreWorkflowVersion } from 'test/integration/graphql/suites/workflow/utils/run-core-workflow-version.util';
import { runWorkflowVersionThroughMcp } from 'test/integration/graphql/suites/workflow/utils/run-workflow-version-through-mcp.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { loginAsTwentyCli } from 'test/integration/metadata/suites/application/utils/login-as-twenty-cli.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { WorkflowVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

const RUN_PREFIX = `Failing core workflow version run ${randomUUID()}`;

const WORKSPACE_SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;

const maskIds = (message: string) => message.replace(UUID_PATTERN, '<id>');

const UNKNOWN_CORE_WORKFLOW_VERSION_ID = randomUUID();

type GlobalTestContext = {
  adminOAuthClientToken: string;
  memberOAuthClientToken: string;
  workspaceWorkflow: { coreWorkflowId: string; coreWorkflowVersionId: string };
  anotherMemberPrivateWorkflow: {
    coreWorkflowId: string;
    coreWorkflowVersionId: string;
  };
  workflowWithoutTrigger: {
    coreWorkflowId: string;
    coreWorkflowVersionId: string;
  };
};

type CallerTestContext = {
  token: (globalContext: GlobalTestContext) => string;
};

type TargetTestContext = {
  coreWorkflowVersionId: (globalContext: GlobalTestContext) => string;
};

// The seeded Member role lacks the WORKFLOWS permission flag
const memberWithoutWorkflowsPermissionCallerTestCases: EachTestingContext<CallerTestContext>[] =
  [
    {
      title: 'with a member session without the WORKFLOWS permission',
      context: { token: () => APPLE_JONY_MEMBER_ACCESS_TOKEN },
    },
    {
      title:
        'with an OAuth client signed in as a member without the WORKFLOWS permission',
      context: {
        token: (globalContext) => globalContext.memberOAuthClientToken,
      },
    },
  ];

const adminCallerTestCases: EachTestingContext<CallerTestContext>[] = [
  {
    title: 'with an admin session',
    context: { token: () => APPLE_JANE_ADMIN_ACCESS_TOKEN },
  },
  {
    title: 'with an OAuth client signed in as the admin',
    context: {
      token: (globalContext) => globalContext.adminOAuthClientToken,
    },
  },
];

const targetTestCases: EachTestingContext<TargetTestContext>[] = [
  {
    title: 'a private workflow of another member',
    context: {
      coreWorkflowVersionId: (globalContext) =>
        globalContext.anotherMemberPrivateWorkflow.coreWorkflowVersionId,
    },
  },
  {
    title: 'an unknown workflow version',
    context: { coreWorkflowVersionId: () => UNKNOWN_CORE_WORKFLOW_VERSION_ID },
  },
  {
    title: 'a workflow version without a trigger',
    context: {
      coreWorkflowVersionId: (globalContext) =>
        globalContext.workflowWithoutTrigger.coreWorkflowVersionId,
    },
  },
];

const setCoreWorkflowOwnership = async ({
  coreWorkflowId,
  visibility,
  createdByUserWorkspaceId,
}: {
  coreWorkflowId: string;
  visibility: WorkflowVisibility;
  createdByUserWorkspaceId: string;
}) => {
  await global.testDataSource.query(
    `UPDATE core."workflow" SET visibility = $2, "createdByUserWorkspaceId" = $3 WHERE id = $1`,
    [coreWorkflowId, visibility, createdByUserWorkspaceId],
  );

  await global.workflowTestServices.workspaceCache.invalidateAndRecompute(
    SEED_APPLE_WORKSPACE_ID,
    ['flatWorkflowMaps'],
  );
};

const countWorkflowRuns = async (coreWorkflowVersionIds: string[]) => {
  const [{ count }] = await global.testDataSource.query(
    `SELECT COUNT(*)::int AS count FROM "${WORKSPACE_SCHEMA}"."workflowRun"
     WHERE "coreWorkflowVersionId" = ANY($1::uuid[])`,
    [coreWorkflowVersionIds],
  );

  return count;
};

describe('Core workflow version runs should fail', () => {
  let globalTestContext: GlobalTestContext;

  beforeAll(async () => {
    const anotherMemberPrivateWorkflow = await createManualCoreWorkflowDraft({
      name: `${RUN_PREFIX} another member private workflow`,
    });

    await setCoreWorkflowOwnership({
      coreWorkflowId: anotherMemberPrivateWorkflow.coreWorkflowId,
      visibility: WorkflowVisibility.PRIVATE,
      createdByUserWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
    });

    globalTestContext = {
      adminOAuthClientToken: await loginAsTwentyCli(),
      memberOAuthClientToken: await loginAsTwentyCli(
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      ),
      workspaceWorkflow: await createManualCoreWorkflowDraft({
        name: `${RUN_PREFIX} workspace workflow`,
      }),
      anotherMemberPrivateWorkflow,
      workflowWithoutTrigger: await createCoreWorkflow({
        name: `${RUN_PREFIX} workflow without trigger`,
      }),
    };
  }, 120000);

  afterAll(async () => {
    if (isDefined(globalTestContext)) {
      await setCoreWorkflowOwnership({
        coreWorkflowId:
          globalTestContext.anotherMemberPrivateWorkflow.coreWorkflowId,
        visibility: WorkflowVisibility.WORKSPACE,
        createdByUserWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      });

      await deleteCoreWorkflows({
        coreWorkflowIds: [
          globalTestContext.workspaceWorkflow.coreWorkflowId,
          globalTestContext.anotherMemberPrivateWorkflow.coreWorkflowId,
          globalTestContext.workflowWithoutTrigger.coreWorkflowId,
        ],
      });
    }

    await uninstallApplication({
      universalIdentifier:
        TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
      expectToFail: false,
    });
  });

  describe.each(
    eachTestingContextFilter(memberWithoutWorkflowsPermissionCallerTestCases),
  )('$title', ({ context: callerContext }) => {
    it('should refuse to run a workspace workflow through the GraphQL API', async () => {
      const { errors } = await runCoreWorkflowVersion({
        input: {
          coreWorkflowVersionId:
            globalTestContext.workspaceWorkflow.coreWorkflowVersionId,
        },
        token: callerContext.token(globalTestContext),
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    });

    it('should not offer the MCP run_workflow_version tool', async () => {
      const output = await runWorkflowVersionThroughMcp({
        coreWorkflowVersionId:
          globalTestContext.workspaceWorkflow.coreWorkflowVersionId,
        token: callerContext.token(globalTestContext),
      });

      expect(output).toMatchObject({
        success: false,
        message: 'Tool "run_workflow_version" not found',
      });
    });
  });

  describe.each(eachTestingContextFilter(adminCallerTestCases))(
    '$title',
    ({ context: callerContext }) => {
      describe.each(eachTestingContextFilter(targetTestCases))(
        'running $title',
        ({ context: targetContext }) => {
          it('should refuse through the GraphQL API', async () => {
            const { errors } = await runCoreWorkflowVersion({
              input: {
                coreWorkflowVersionId:
                  targetContext.coreWorkflowVersionId(globalTestContext),
              },
              token: callerContext.token(globalTestContext),
              expectToFail: true,
            });

            expectOneNotInternalServerErrorSnapshot({
              errors,
              normalizeMessage: maskIds,
            });
          });

          it('should refuse through the MCP run_workflow_version tool', async () => {
            const { success, error, message } =
              await runWorkflowVersionThroughMcp({
                coreWorkflowVersionId:
                  targetContext.coreWorkflowVersionId(globalTestContext),
                token: callerContext.token(globalTestContext),
              });

            expect({
              success,
              error: isDefined(error) ? maskIds(error) : error,
              message: maskIds(message),
            }).toMatchSnapshot();
          });
        },
      );
    },
  );

  it('should not have started any run for the refused versions', async () => {
    expect(
      await countWorkflowRuns([
        globalTestContext.workspaceWorkflow.coreWorkflowVersionId,
        globalTestContext.anotherMemberPrivateWorkflow.coreWorkflowVersionId,
        globalTestContext.workflowWithoutTrigger.coreWorkflowVersionId,
      ]),
    ).toBe(0);
  });
});

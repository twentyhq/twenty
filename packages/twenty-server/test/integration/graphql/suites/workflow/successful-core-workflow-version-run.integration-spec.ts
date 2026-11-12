import { randomUUID } from 'node:crypto';

import { deleteCoreWorkflows } from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { createManualCoreWorkflowDraft } from 'test/integration/graphql/suites/workflow/utils/create-manual-core-workflow-draft.util';
import { runCoreWorkflowVersion } from 'test/integration/graphql/suites/workflow/utils/run-core-workflow-version.util';
import { runWorkflowVersionThroughMcp } from 'test/integration/graphql/suites/workflow/utils/run-workflow-version-through-mcp.util';
import { updateCoreWorkflowVisibility } from 'test/integration/graphql/suites/workflow/utils/update-core-workflow-visibility.util';
import { destroyWorkflowRun } from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';
import { loginAsTwentyCli } from 'test/integration/metadata/suites/application/utils/login-as-twenty-cli.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { FieldActorSource, WorkflowVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

const RUN_PREFIX = `Successful core workflow version run ${randomUUID()}`;

const WORKSPACE_SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

type RunnableCoreWorkflow = {
  coreWorkflowId: string;
  coreWorkflowVersionId: string;
};

type GlobalTestContext = {
  oauthClientToken: string;
  workspaceWorkflow: RunnableCoreWorkflow;
  privateWorkflow: RunnableCoreWorkflow;
};

type CallerTestContext = {
  token: (globalContext: GlobalTestContext) => string;
};

type ChannelTestContext = {
  run: (args: {
    coreWorkflowVersionId: string;
    token: string;
  }) => Promise<string>;
};

type TargetTestContext = {
  workflow: (globalContext: GlobalTestContext) => RunnableCoreWorkflow;
};

const callerTestCases: EachTestingContext<CallerTestContext>[] = [
  {
    title: 'with an admin session',
    context: { token: () => APPLE_JANE_ADMIN_ACCESS_TOKEN },
  },
  {
    title: 'with an OAuth client signed in as the admin',
    context: { token: (globalContext) => globalContext.oauthClientToken },
  },
];

const channelTestCases: EachTestingContext<ChannelTestContext>[] = [
  {
    title: 'through the GraphQL API',
    context: {
      run: async ({ coreWorkflowVersionId, token }) => {
        const { data } = await runCoreWorkflowVersion({
          input: { coreWorkflowVersionId },
          token,
          expectToFail: false,
        });

        jestExpectToBeDefined(data.runCoreWorkflowVersion);

        return data.runCoreWorkflowVersion.workflowRunId;
      },
    },
  },
  {
    title: 'through the MCP run_workflow_version tool',
    context: {
      run: async ({ coreWorkflowVersionId, token }) => {
        const output = await runWorkflowVersionThroughMcp({
          coreWorkflowVersionId,
          token,
        });

        expect(output.success).toBe(true);
        jestExpectToBeDefined(output.workflowRunId);

        return output.workflowRunId;
      },
    },
  },
];

const targetTestCases: EachTestingContext<TargetTestContext>[] = [
  {
    title: 'a workspace workflow draft',
    context: { workflow: (globalContext) => globalContext.workspaceWorkflow },
  },
  {
    title: 'a private workflow draft it created',
    context: { workflow: (globalContext) => globalContext.privateWorkflow },
  },
];

const findWorkflowRun = async (workflowRunId: string) => {
  const [workflowRun] = await global.testDataSource.query(
    `SELECT "coreWorkflowVersionId", "createdBySource", "createdByWorkspaceMemberId"
     FROM "${WORKSPACE_SCHEMA}"."workflowRun" WHERE id = $1`,
    [workflowRunId],
  );

  return workflowRun;
};

describe('Core workflow version runs should succeed', () => {
  let globalTestContext: GlobalTestContext;
  const workflowRunIds: string[] = [];

  beforeAll(async () => {
    const privateWorkflow = await createManualCoreWorkflowDraft({
      name: `${RUN_PREFIX} private workflow`,
    });

    await updateCoreWorkflowVisibility({
      input: {
        coreWorkflowId: privateWorkflow.coreWorkflowId,
        visibility: WorkflowVisibility.PRIVATE,
      },
      expectToFail: false,
    });

    globalTestContext = {
      oauthClientToken: await loginAsTwentyCli(),
      workspaceWorkflow: await createManualCoreWorkflowDraft({
        name: `${RUN_PREFIX} workspace workflow`,
      }),
      privateWorkflow,
    };
  }, 120000);

  afterAll(async () => {
    for (const workflowRunId of workflowRunIds) {
      await destroyWorkflowRun(workflowRunId);
    }

    if (isDefined(globalTestContext)) {
      await deleteCoreWorkflows({
        coreWorkflowIds: [
          globalTestContext.workspaceWorkflow.coreWorkflowId,
          globalTestContext.privateWorkflow.coreWorkflowId,
        ],
      });
    }

    await uninstallApplication({
      universalIdentifier:
        TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
      expectToFail: false,
    });
  });

  describe.each(eachTestingContextFilter(callerTestCases))(
    '$title',
    ({ context: callerContext }) => {
      describe.each(eachTestingContextFilter(channelTestCases))(
        '$title',
        ({ context: channelContext }) => {
          it.each(eachTestingContextFilter(targetTestCases))(
            'should run $title on behalf of the signed-in member',
            async ({ context: targetContext }) => {
              const { coreWorkflowVersionId } =
                targetContext.workflow(globalTestContext);

              const workflowRunId = await channelContext.run({
                coreWorkflowVersionId,
                token: callerContext.token(globalTestContext),
              });

              workflowRunIds.push(workflowRunId);

              expect(await findWorkflowRun(workflowRunId)).toEqual({
                coreWorkflowVersionId,
                createdBySource: FieldActorSource.MANUAL,
                createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
              });
            },
          );
        },
      );
    },
  );
});

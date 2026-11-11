import {
  createCoreWorkflow,
  deleteCoreWorkflows,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { testWorkflowCodeStep } from 'test/integration/graphql/suites/workflow/utils/test-workflow-code-step.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { setWorkspaceActivationStatus } from 'test/integration/graphql/utils/set-workspace-activation-status.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

type InactiveWorkspaceTestContext = {
  activationStatus: WorkspaceActivationStatus;
};

const inactiveWorkspaceTestCases: EachTestingContext<InactiveWorkspaceTestContext>[] =
  [
    {
      title: 'in a workspace pending creation',
      context: { activationStatus: WorkspaceActivationStatus.PENDING_CREATION },
    },
    {
      title: 'in a workspace created without a subscription',
      context: { activationStatus: WorkspaceActivationStatus.CREATED },
    },
  ];

describe('Workflow code step tests should fail', () => {
  let coreWorkflowId: string;
  let coreWorkflowVersionId: string;

  beforeAll(async () => {
    ({ coreWorkflowId, coreWorkflowVersionId } = await createCoreWorkflow({
      name: 'Code step in an inactive workspace',
    }));
  });

  afterAll(async () => {
    await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
  });

  describe.each(eachTestingContextFilter(inactiveWorkspaceTestCases))(
    '$title',
    ({ context }) => {
      beforeAll(async () => {
        await setWorkspaceActivationStatus({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          activationStatus: context.activationStatus,
        });
      });

      afterAll(async () => {
        await setWorkspaceActivationStatus({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          activationStatus: WorkspaceActivationStatus.ACTIVE,
        });
      });

      it('should refuse to run the code', async () => {
        const { errors } = await testWorkflowCodeStep({
          input: {
            workflowVersionId: coreWorkflowVersionId,
            code: 'export const main = async () => ({ hasRun: true });',
            payload: {},
          },
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });
    },
  );
});

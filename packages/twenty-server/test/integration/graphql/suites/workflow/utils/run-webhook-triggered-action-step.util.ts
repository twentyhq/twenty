import request from 'supertest';

import {
  activateCoreWorkflowVersion,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  updateCoreWorkflowVersionStepInput,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow-test.util';
import {
  destroyWorkflowRun,
  waitForWorkflowCompletion,
  type WorkflowRunStatusType,
} from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

export type WebhookTriggeredActionStepRun = {
  status?: WorkflowRunStatusType;
  stepStatus?: string;
  stepResult?: Record<string, unknown>;
  stepError?: string;
};

export const runWebhookTriggeredActionStep = async ({
  name,
  stepType,
  input,
}: {
  name: string;
  stepType: 'SEND_EMAIL' | 'DRAFT_EMAIL';
  input: Record<string, unknown>;
}): Promise<WebhookTriggeredActionStepRun> => {
  const { coreWorkflowId, coreWorkflowVersionId } = await createCoreWorkflow({
    name,
  });

  let workflowRunId: string | undefined;

  try {
    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId,
      trigger: {
        name: 'Webhook Trigger',
        type: 'WEBHOOK',
        settings: {
          outputSchema: {},
          httpMethod: 'GET',
          authentication: null,
        },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

    const step = await createCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      stepType,
    });

    await updateCoreWorkflowVersionStepInput({
      coreWorkflowVersionId,
      step,
      input,
    });

    await activateCoreWorkflowVersion(coreWorkflowVersionId);

    const webhookResponse = await request(`http://localhost:${APP_PORT}`).get(
      `/webhooks/workflows/${SEED_APPLE_WORKSPACE_ID}/${coreWorkflowId}`,
    );

    expect(webhookResponse.body.success).toBe(true);

    workflowRunId = webhookResponse.body.workflowRunId;

    const workflowRun = await waitForWorkflowCompletion(workflowRunId!);
    const stepInfo = workflowRun?.state?.stepInfos?.[step.id];

    return {
      status: workflowRun?.status,
      stepStatus: stepInfo?.status,
      stepResult: stepInfo?.result,
      stepError: stepInfo?.error,
    };
  } finally {
    if (workflowRunId !== undefined) {
      await destroyWorkflowRun(workflowRunId);
    }

    await deleteCoreWorkflows([coreWorkflowId]);
  }
};

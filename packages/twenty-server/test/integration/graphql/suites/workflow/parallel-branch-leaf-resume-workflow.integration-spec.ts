import {
  activateCoreWorkflowVersion,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  findCoreWorkflowVersion,
  updateCoreWorkflowVersionStep,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import {
  destroyWorkflowRun,
  getWorkflowRun,
} from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type WorkflowRunRecordShareService } from 'src/engine/core-modules/workflow/services/workflow-run-record-share.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { submitFormStep } from 'test/integration/graphql/suites/workflow/utils/submit-form-step.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

const schema = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
const DELAY_DURATION_SECONDS = 20;

describe('Parallel branch leaf resume workflow (e2e)', () => {
  let coreWorkflowId: string | null = null;
  let coreWorkflowVersionId: string | null = null;
  let workspaceWorkflowId: string | null = null;
  let formStepId: string | null = null;
  let delayStepId: string | null = null;
  let sendEmailStepId: string | null = null;
  let createdWorkflowRunId: string | null = null;

  beforeAll(async () => {
    const coreWorkflow = await createCoreWorkflow({
      name: 'Parallel Branch Leaf Resume Workflow',
    });

    coreWorkflowId = coreWorkflow.coreWorkflowId;
    coreWorkflowVersionId = coreWorkflow.coreWorkflowVersionId;
    workspaceWorkflowId = coreWorkflow.workspaceWorkflowId;

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId,
      trigger: {
        name: 'Manual Trigger',
        type: 'MANUAL',
        settings: { outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

    formStepId = (
      await createCoreWorkflowVersionStep({
        coreWorkflowVersionId,
        stepType: 'FORM',
      })
    ).id;

    delayStepId = (
      await createCoreWorkflowVersionStep({
        coreWorkflowVersionId,
        stepType: 'DELAY',
      })
    ).id;

    sendEmailStepId = (
      await createCoreWorkflowVersionStep({
        coreWorkflowVersionId,
        stepType: 'SEND_EMAIL',
        parentStepId: delayStepId,
      })
    ).id;

    const { steps } = await findCoreWorkflowVersion({ coreWorkflowVersionId });

    const formStep = steps?.find((step) => step.id === formStepId);

    expect(formStep).toBeDefined();

    await updateCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      step: {
        ...formStep!,
        settings: {
          ...formStep!.settings,
          input: [
            {
              id: v4(),
              name: 'answer',
              label: 'Answer',
              type: FieldMetadataType.TEXT,
            },
          ],
        },
      },
    });

    const delayStep = steps?.find((step) => step.id === delayStepId);

    expect(delayStep).toBeDefined();

    await updateCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      step: {
        ...delayStep!,
        settings: {
          ...delayStep!.settings,
          input: {
            delayType: 'DURATION',
            duration: { seconds: DELAY_DURATION_SECONDS },
          },
        },
      },
    });

    await activateCoreWorkflowVersion({ coreWorkflowVersionId });
  });

  afterAll(async () => {
    if (createdWorkflowRunId) {
      await destroyWorkflowRun(createdWorkflowRunId);
    }

    if (coreWorkflowId) {
      await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
    }
  });

  it('keeps the run alive and the delay branch pending when the parallel form leaf is submitted', async () => {
    const { trigger, steps, workspaceWorkflowVersionId } =
      await findCoreWorkflowVersion({
        coreWorkflowVersionId: coreWorkflowVersionId!,
      });

    createdWorkflowRunId = v4();

    const state = {
      flow: { trigger, steps },
      stepInfos: {
        trigger: { status: 'NOT_STARTED', result: {} },
        ...Object.fromEntries(
          (steps ?? []).map((step) => [step.id, { status: 'NOT_STARTED' }]),
        ),
      },
    };

    // Inserted directly so no start job is enqueued and the manual handle is the only driver.
    await global.testDataSource.query(
      `INSERT INTO "${schema}"."workflowRun" (id, name, "workflowId", "workflowVersionId", "coreWorkflowId", "coreWorkflowVersionId", status, state, position, "enqueuedAt")
       VALUES ($1, 'Parallel branch leaf resume run', $2, $3, $4, $5, 'ENQUEUED', $6, 0, now())`,
      [
        createdWorkflowRunId,
        workspaceWorkflowId,
        workspaceWorkflowVersionId,
        coreWorkflowId,
        coreWorkflowVersionId,
        JSON.stringify(state),
      ],
    );
    // A direct insert skips the run's grants, leaving it unreadable through the record API.
    await getAppProviderByClassName<WorkflowRunRecordShareService>(
      'WorkflowRunRecordShareService',
    ).syncRuns({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workflowRunIds: [createdWorkflowRunId],
    });

    await (
      await global.workflowTestServices.runJob()
    ).handle({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workflowRunId: createdWorkflowRunId,
    });

    const pendingRun = await getWorkflowRun(createdWorkflowRunId);

    expect(pendingRun?.status).toBe('RUNNING');
    expect(pendingRun?.state?.stepInfos?.[formStepId!]?.status).toBe('PENDING');
    expect(pendingRun?.state?.stepInfos?.[delayStepId!]?.status).toBe(
      'PENDING',
    );
    expect(pendingRun?.state?.stepInfos?.[sendEmailStepId!]?.status).toBe(
      'NOT_STARTED',
    );

    const submitFormResponse = await submitFormStep({
      workflowRunId: createdWorkflowRunId,
      stepId: formStepId!,
      response: { answer: 'Submitted from integration test' },
    });

    expect(submitFormResponse.body.errors).toBeUndefined();
    expect(submitFormResponse.body.data.submitFormStep).toBe(true);

    await (
      await global.workflowTestServices.runJob()
    ).handle({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      workflowRunId: createdWorkflowRunId,
      lastExecutedStepId: formStepId!,
    });

    const runAfterSubmit = await getWorkflowRun(createdWorkflowRunId);

    expect(runAfterSubmit?.status).toBe('RUNNING');
    expect(runAfterSubmit?.state?.stepInfos?.[formStepId!]?.status).toBe(
      'SUCCESS',
    );
    expect(runAfterSubmit?.state?.stepInfos?.[delayStepId!]?.status).toBe(
      'PENDING',
    );
    expect(runAfterSubmit?.state?.stepInfos?.[sendEmailStepId!]?.status).toBe(
      'NOT_STARTED',
    );
  }, 60000);
});

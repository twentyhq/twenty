import {
  activateCoreWorkflowVersion,
  CORE_WORKFLOW_MANUAL_TRIGGER,
  CORE_WORKFLOW_VERSION_BY_ID_QUERY,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  updateCoreWorkflowVersionStep,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow-test.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
import {
  destroyWorkflowRun,
  getWorkflowRun,
} from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type WorkflowRunRecordShareService } from 'src/engine/core-modules/workflow/services/workflow-run-record-share.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import {
  type WorkflowAction,
  type WorkflowDelayAction,
  type WorkflowFormAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { submitFormStep } from 'test/integration/graphql/suites/workflow/utils/submit-form-step.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

const schema = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
const DELAY_DURATION_SECONDS = 20;

describe('Parallel branch leaf resume workflow (e2e)', () => {
  let createdCoreWorkflowId: string | null = null;
  let createdCoreWorkflowVersionId: string | null = null;
  let formStepId: string | null = null;
  let delayStepId: string | null = null;
  let sendEmailStepId: string | null = null;
  let createdWorkflowRunId: string | null = null;

  const getVersionContent = async (): Promise<{
    trigger: WorkflowTrigger;
    steps: WorkflowAction[];
  }> => {
    const response = await workflowGraphqlRequest(
      CORE_WORKFLOW_VERSION_BY_ID_QUERY,
      { coreWorkflowVersionId: createdCoreWorkflowVersionId },
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.coreWorkflowVersionById;
  };

  beforeAll(async () => {
    const { coreWorkflowId, coreWorkflowVersionId } = await createCoreWorkflow({
      name: 'Parallel Branch Leaf Resume Workflow',
    });

    createdCoreWorkflowId = coreWorkflowId;
    createdCoreWorkflowVersionId = coreWorkflowVersionId;

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId,
      trigger: CORE_WORKFLOW_MANUAL_TRIGGER,
    });

    const createdFormStep = await createCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      stepType: 'FORM',
    });

    formStepId = createdFormStep.id;

    const createdDelayStep = await createCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      stepType: 'DELAY',
    });

    delayStepId = createdDelayStep.id;

    const createdSendEmailStep = await createCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      stepType: 'SEND_EMAIL',
      parentStepId: createdDelayStep.id,
    });

    sendEmailStepId = createdSendEmailStep.id;

    const { steps } = await getVersionContent();

    const formStep = steps.find(
      (step): step is WorkflowFormAction => step.id === formStepId,
    );

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

    const delayStep = steps.find(
      (step): step is WorkflowDelayAction => step.id === delayStepId,
    );

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

    await activateCoreWorkflowVersion(coreWorkflowVersionId);
  });

  afterAll(async () => {
    if (isDefined(createdWorkflowRunId)) {
      await destroyWorkflowRun(createdWorkflowRunId);
    }

    if (isDefined(createdCoreWorkflowId)) {
      await deleteCoreWorkflows([createdCoreWorkflowId]);
    }
  });

  it('keeps the run alive and the delay branch pending when the parallel form leaf is submitted', async () => {
    const { trigger, steps } = await getVersionContent();

    createdWorkflowRunId = v4();

    const state = {
      flow: { trigger, steps },
      stepInfos: {
        trigger: { status: 'NOT_STARTED', result: {} },
        ...Object.fromEntries(
          steps.map((step) => [step.id, { status: 'NOT_STARTED' }]),
        ),
      },
    };

    // Inserted directly so no start job is enqueued and the manual handle is the only driver.
    await global.testDataSource.query(
      `INSERT INTO "${schema}"."workflowRun" (id, name, "coreWorkflowId", "coreWorkflowVersionId", status, state, position, "enqueuedAt")
       VALUES ($1, 'Parallel branch leaf resume run', $2, $3, 'ENQUEUED', $4, 0, now())`,
      [
        createdWorkflowRunId,
        createdCoreWorkflowId,
        createdCoreWorkflowVersionId,
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

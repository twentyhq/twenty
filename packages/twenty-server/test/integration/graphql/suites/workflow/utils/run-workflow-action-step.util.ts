import gql from 'graphql-tag';
import { updateWorkflowVersionTrigger } from 'test/integration/graphql/suites/workflow/utils/update-workflow-version-trigger.util';
import { isDefined } from 'twenty-shared/utils';
import {
  destroyWorkflowRun,
  runWorkflowVersion,
  waitForWorkflowCompletion,
  type WorkflowRunStatusType,
} from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

type WorkflowActionStepType =
  | 'SEND_EMAIL'
  | 'DRAFT_EMAIL'
  | 'CREATE_CALENDAR_EVENT';

type WorkflowVersionStep = {
  id: string;
  type: string;
  settings: { input: Record<string, unknown> };
};

export type WorkflowActionStepRun = {
  status?: WorkflowRunStatusType;
  stepStatus?: string;
  stepResult?: Record<string, unknown>;
};

const createWorkflow = async (name: string): Promise<string> => {
  const response = await makeGraphqlAPIRequest({
    query: gql`
      mutation CreateWorkflow($name: String!) {
        createWorkflow(data: { name: $name }) {
          id
        }
      }
    `,
    variables: { name },
  });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.createWorkflow.id;
};

const destroyWorkflow = async (workflowId: string): Promise<void> => {
  await makeGraphqlAPIRequest({
    query: gql`
      mutation DestroyWorkflow($id: ID!) {
        destroyWorkflow(id: $id) {
          id
        }
      }
    `,
    variables: { id: workflowId },
  });
};

const findDraftWorkflowVersionId = async (
  workflowId: string,
): Promise<string> => {
  const response = await makeGraphqlAPIRequest({
    query: gql`
      query FindWorkflowVersions($workflowId: UUID!) {
        workflow(filter: { id: { eq: $workflowId } }) {
          versions {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    `,
    variables: { workflowId },
  });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.workflow.versions.edges[0].node.id;
};

const createWorkflowVersionStep = async ({
  workflowVersionId,
  stepType,
}: {
  workflowVersionId: string;
  stepType: WorkflowActionStepType;
}): Promise<void> => {
  const response = await makeGraphqlAPIRequest({
    query: gql`
      mutation CreateWorkflowVersionStep(
        $input: CreateWorkflowVersionStepInput!
      ) {
        createWorkflowVersionStep(input: $input) {
          stepsDiff
        }
      }
    `,
    variables: {
      input: {
        workflowVersionId,
        stepType,
        parentStepId: 'trigger',
        position: { x: 200, y: 0 },
      },
    },
  });

  expect(response.body.errors).toBeUndefined();
};

const findWorkflowVersionStep = async ({
  workflowVersionId,
  stepType,
}: {
  workflowVersionId: string;
  stepType: WorkflowActionStepType;
}): Promise<WorkflowVersionStep> => {
  const response = await makeGraphqlAPIRequest({
    query: gql`
      query FindWorkflowVersionSteps($workflowVersionId: UUID!) {
        workflowVersion(filter: { id: { eq: $workflowVersionId } }) {
          steps
        }
      }
    `,
    variables: { workflowVersionId },
  });

  expect(response.body.errors).toBeUndefined();

  const step = response.body.data.workflowVersion.steps.find(
    (workflowVersionStep: WorkflowVersionStep) =>
      workflowVersionStep.type === stepType,
  );

  expect(step).toBeDefined();

  return step;
};

const updateWorkflowVersionStepInput = async ({
  workflowVersionId,
  step,
  input,
}: {
  workflowVersionId: string;
  step: WorkflowVersionStep;
  input: Record<string, unknown>;
}): Promise<void> => {
  const response = await makeGraphqlAPIRequest({
    query: gql`
      mutation UpdateWorkflowVersionStep(
        $input: UpdateWorkflowVersionStepInput!
      ) {
        updateWorkflowVersionStep(input: $input) {
          id
        }
      }
    `,
    variables: {
      input: {
        workflowVersionId,
        step: {
          ...step,
          settings: {
            ...step.settings,
            input: { ...step.settings.input, ...input },
          },
        },
      },
    },
  });

  expect(response.body.errors).toBeUndefined();
};

export const runWorkflowActionStep = async ({
  name,
  stepType,
  input,
  payload,
}: {
  name: string;
  stepType: WorkflowActionStepType;
  input: Record<string, unknown>;
  payload?: object;
}): Promise<WorkflowActionStepRun> => {
  const workflowId = await createWorkflow(name);

  let workflowRunId: string | undefined;

  try {
    const workflowVersionId = await findDraftWorkflowVersionId(workflowId);

    await updateWorkflowVersionTrigger({
      workflowVersionId,
      trigger: {
        name: 'Manual Trigger',
        type: 'MANUAL',
        settings: { outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

    await createWorkflowVersionStep({ workflowVersionId, stepType });

    const step = await findWorkflowVersionStep({ workflowVersionId, stepType });

    await updateWorkflowVersionStepInput({ workflowVersionId, step, input });

    workflowRunId = await runWorkflowVersion({ workflowVersionId, payload });

    const workflowRun = await waitForWorkflowCompletion(workflowRunId);
    const stepInfo = workflowRun?.state?.stepInfos?.[step.id];

    return {
      status: workflowRun?.status,
      stepStatus: stepInfo?.status,
      stepResult: stepInfo?.result,
    };
  } finally {
    if (isDefined(workflowRunId)) {
      await destroyWorkflowRun(workflowRunId);
    }

    await destroyWorkflow(workflowId);
  }
};

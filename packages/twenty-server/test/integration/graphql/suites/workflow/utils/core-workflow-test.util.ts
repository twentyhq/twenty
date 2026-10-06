import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
import { isDefined } from 'twenty-shared/utils';

export type CoreWorkflowStep = {
  id: string;
  name: string;
  type: string;
  valid?: boolean;
  nextStepIds?: string[] | null;
  position?: { x: number; y: number };
  settings: { input: Record<string, unknown> } & Record<string, unknown>;
};

export type CoreWorkflowVersion = {
  id: string;
  coreWorkflowId: string | null;
  status: string;
  trigger: Record<string, unknown> | null;
  steps: CoreWorkflowStep[] | null;
};

export type CoreWorkflow = {
  id: string;
  name: string | null;
  statuses: string[];
  lastPublishedCoreWorkflowVersionId: string | null;
  visibility: string;
};

export type CreatedCoreWorkflow = {
  coreWorkflowId: string;
  coreWorkflowVersionId: string;
};

export const CORE_WORKFLOW_MANUAL_TRIGGER = {
  name: 'Manual Trigger',
  type: 'MANUAL',
  settings: { outputSchema: {} },
  nextStepIds: [],
  position: { x: 0, y: 0 },
};

export const CREATE_CORE_WORKFLOW_MUTATION = `
  mutation CreateCoreWorkflow($input: CreateCoreWorkflowInput!) {
    createCoreWorkflow(input: $input) {
      id
    }
  }
`;

export const DELETE_CORE_WORKFLOWS_MUTATION = `
  mutation DeleteCoreWorkflows($input: DeleteCoreWorkflowsInput!) {
    deleteCoreWorkflows(input: $input) {
      id
    }
  }
`;

export const CORE_WORKFLOW_BY_ID_QUERY = `
  query CoreWorkflowById($coreWorkflowId: UUID!) {
    coreWorkflowById(coreWorkflowId: $coreWorkflowId) {
      id
      name
      statuses
      lastPublishedCoreWorkflowVersionId
      visibility
    }
  }
`;

export const CORE_WORKFLOW_VERSIONS_BY_CORE_WORKFLOW_ID_QUERY = `
  query CoreWorkflowVersionsByCoreWorkflowId($coreWorkflowId: UUID!) {
    coreWorkflowVersionsByCoreWorkflowId(coreWorkflowId: $coreWorkflowId) {
      id
      coreWorkflowId
      status
      trigger
      steps
    }
  }
`;

export const CORE_WORKFLOW_VERSION_BY_ID_QUERY = `
  query CoreWorkflowVersionById($coreWorkflowVersionId: UUID!) {
    coreWorkflowVersionById(coreWorkflowVersionId: $coreWorkflowVersionId) {
      id
      coreWorkflowId
      status
      trigger
      steps
    }
  }
`;

export const UPDATE_CORE_WORKFLOW_VERSION_TRIGGER_MUTATION = `
  mutation UpdateCoreWorkflowVersionTrigger(
    $input: UpdateCoreWorkflowVersionTriggerInput!
  ) {
    updateCoreWorkflowVersionTrigger(input: $input) {
      trigger
    }
  }
`;

export const CREATE_CORE_WORKFLOW_VERSION_STEP_MUTATION = `
  mutation CreateCoreWorkflowVersionStep(
    $input: CreateCoreWorkflowVersionStepInput!
  ) {
    createCoreWorkflowVersionStep(input: $input) {
      stepsDiff
    }
  }
`;

export const UPDATE_CORE_WORKFLOW_VERSION_STEP_MUTATION = `
  mutation UpdateCoreWorkflowVersionStep(
    $input: UpdateCoreWorkflowVersionStepInput!
  ) {
    updateCoreWorkflowVersionStep(input: $input) {
      id
    }
  }
`;

export const ACTIVATE_CORE_WORKFLOW_VERSION_MUTATION = `
  mutation ActivateCoreWorkflowVersion($coreWorkflowVersionId: UUID!) {
    activateCoreWorkflowVersion(coreWorkflowVersionId: $coreWorkflowVersionId)
  }
`;

export const DEACTIVATE_CORE_WORKFLOW_VERSION_MUTATION = `
  mutation DeactivateCoreWorkflowVersion($coreWorkflowVersionId: UUID!) {
    deactivateCoreWorkflowVersion(
      coreWorkflowVersionId: $coreWorkflowVersionId
    )
  }
`;

export const RUN_CORE_WORKFLOW_VERSION_MUTATION = `
  mutation RunCoreWorkflowVersion($input: RunCoreWorkflowVersionInput!) {
    runCoreWorkflowVersion(input: $input) {
      workflowRunId
    }
  }
`;

export const CREATE_DRAFT_FROM_CORE_WORKFLOW_VERSION_MUTATION = `
  mutation CreateDraftFromCoreWorkflowVersion(
    $input: CreateDraftFromCoreWorkflowVersionInput!
  ) {
    createDraftFromCoreWorkflowVersion(input: $input) {
      id
    }
  }
`;

const requestOrThrow = async <TData>({
  operationName,
  query,
  variables,
  token,
}: {
  operationName: string;
  query: string;
  variables?: object;
  token?: string;
}): Promise<TData> => {
  const response = await workflowGraphqlRequest(query, variables, token);

  if (isDefined(response.body.errors) || !isDefined(response.body.data)) {
    throw new Error(
      `${operationName} failed: ${JSON.stringify(response.body.errors)}`,
    );
  }

  return response.body.data as TData;
};

export const findCoreWorkflowVersionsByCoreWorkflowId = async (
  coreWorkflowId: string,
  token?: string,
): Promise<CoreWorkflowVersion[]> => {
  const data = await requestOrThrow<{
    coreWorkflowVersionsByCoreWorkflowId: CoreWorkflowVersion[];
  }>({
    operationName: 'coreWorkflowVersionsByCoreWorkflowId',
    query: CORE_WORKFLOW_VERSIONS_BY_CORE_WORKFLOW_ID_QUERY,
    variables: { coreWorkflowId },
    token,
  });

  return data.coreWorkflowVersionsByCoreWorkflowId;
};

export const findCoreWorkflowVersionById = async (
  coreWorkflowVersionId: string,
  token?: string,
): Promise<CoreWorkflowVersion | null> => {
  const data = await requestOrThrow<{
    coreWorkflowVersionById: CoreWorkflowVersion | null;
  }>({
    operationName: 'coreWorkflowVersionById',
    query: CORE_WORKFLOW_VERSION_BY_ID_QUERY,
    variables: { coreWorkflowVersionId },
    token,
  });

  return data.coreWorkflowVersionById;
};

export const findCoreWorkflowById = async (
  coreWorkflowId: string,
  token?: string,
): Promise<CoreWorkflow | null> => {
  const data = await requestOrThrow<{ coreWorkflowById: CoreWorkflow | null }>({
    operationName: 'coreWorkflowById',
    query: CORE_WORKFLOW_BY_ID_QUERY,
    variables: { coreWorkflowId },
    token,
  });

  return data.coreWorkflowById;
};

export const createCoreWorkflow = async ({
  name,
  token,
}: {
  name?: string;
  token?: string;
} = {}): Promise<CreatedCoreWorkflow> => {
  const data = await requestOrThrow<{ createCoreWorkflow: { id: string } }>({
    operationName: 'createCoreWorkflow',
    query: CREATE_CORE_WORKFLOW_MUTATION,
    variables: { input: isDefined(name) ? { name } : {} },
    token,
  });

  const coreWorkflowId = data.createCoreWorkflow.id;

  const [draftVersion] = await findCoreWorkflowVersionsByCoreWorkflowId(
    coreWorkflowId,
    token,
  );

  if (!isDefined(draftVersion)) {
    throw new Error(`Core workflow ${coreWorkflowId} has no draft version`);
  }

  return { coreWorkflowId, coreWorkflowVersionId: draftVersion.id };
};

export const deleteCoreWorkflows = async (
  coreWorkflowIds: string[],
  token?: string,
): Promise<void> => {
  if (coreWorkflowIds.length === 0) {
    return;
  }

  await workflowGraphqlRequest(
    DELETE_CORE_WORKFLOWS_MUTATION,
    { input: { coreWorkflowIds } },
    token,
  );
};

export const updateCoreWorkflowVersionTrigger = async ({
  coreWorkflowVersionId,
  trigger,
  token,
}: {
  coreWorkflowVersionId: string;
  trigger: object;
  token?: string;
}): Promise<Record<string, unknown>> => {
  const data = await requestOrThrow<{
    updateCoreWorkflowVersionTrigger: { trigger: Record<string, unknown> };
  }>({
    operationName: 'updateCoreWorkflowVersionTrigger',
    query: UPDATE_CORE_WORKFLOW_VERSION_TRIGGER_MUTATION,
    variables: { input: { coreWorkflowVersionId, trigger } },
    token,
  });

  return data.updateCoreWorkflowVersionTrigger.trigger;
};

export const createCoreWorkflowVersionStep = async ({
  coreWorkflowVersionId,
  stepType,
  parentStepId = 'trigger',
  position = { x: 200, y: 0 },
  token,
  ...otherInputs
}: {
  coreWorkflowVersionId: string;
  stepType: string;
  parentStepId?: string | null;
  parentStepConnectionOptions?: object;
  nextStepId?: string;
  id?: string;
  defaultSettings?: object;
  position?: { x: number; y: number };
  token?: string;
}): Promise<CoreWorkflowStep> => {
  const versionBeforeCreation = await findCoreWorkflowVersionById(
    coreWorkflowVersionId,
    token,
  );

  const existingStepIds = new Set(
    (versionBeforeCreation?.steps ?? []).map((step) => step.id),
  );

  await requestOrThrow({
    operationName: 'createCoreWorkflowVersionStep',
    query: CREATE_CORE_WORKFLOW_VERSION_STEP_MUTATION,
    variables: {
      input: {
        ...otherInputs,
        coreWorkflowVersionId,
        stepType,
        parentStepId: parentStepId ?? undefined,
        position,
      },
    },
    token,
  });

  const versionAfterCreation = await findCoreWorkflowVersionById(
    coreWorkflowVersionId,
    token,
  );

  const createdStep = (versionAfterCreation?.steps ?? []).find(
    (step) => !existingStepIds.has(step.id),
  );

  if (!isDefined(createdStep)) {
    throw new Error(
      `No ${stepType} step was created on core workflow version ${coreWorkflowVersionId}`,
    );
  }

  return createdStep;
};

export const updateCoreWorkflowVersionStep = async ({
  coreWorkflowVersionId,
  step,
  token,
}: {
  coreWorkflowVersionId: string;
  step: object;
  token?: string;
}): Promise<void> => {
  await requestOrThrow({
    operationName: 'updateCoreWorkflowVersionStep',
    query: UPDATE_CORE_WORKFLOW_VERSION_STEP_MUTATION,
    variables: { input: { coreWorkflowVersionId, step } },
    token,
  });
};

export const updateCoreWorkflowVersionStepInput = async ({
  coreWorkflowVersionId,
  step,
  input,
  token,
}: {
  coreWorkflowVersionId: string;
  step: CoreWorkflowStep;
  input: Record<string, unknown>;
  token?: string;
}): Promise<void> =>
  updateCoreWorkflowVersionStep({
    coreWorkflowVersionId,
    step: {
      ...step,
      settings: {
        ...step.settings,
        input: { ...step.settings.input, ...input },
      },
    },
    token,
  });

export const activateCoreWorkflowVersion = async (
  coreWorkflowVersionId: string,
  token?: string,
): Promise<void> => {
  await requestOrThrow({
    operationName: 'activateCoreWorkflowVersion',
    query: ACTIVATE_CORE_WORKFLOW_VERSION_MUTATION,
    variables: { coreWorkflowVersionId },
    token,
  });
};

export const deactivateCoreWorkflowVersion = async (
  coreWorkflowVersionId: string,
  token?: string,
): Promise<void> => {
  await requestOrThrow({
    operationName: 'deactivateCoreWorkflowVersion',
    query: DEACTIVATE_CORE_WORKFLOW_VERSION_MUTATION,
    variables: { coreWorkflowVersionId },
    token,
  });
};

export const runCoreWorkflowVersion = async ({
  coreWorkflowVersionId,
  payload,
  token,
}: {
  coreWorkflowVersionId: string;
  payload?: object;
  token?: string;
}): Promise<string> => {
  const data = await requestOrThrow<{
    runCoreWorkflowVersion: { workflowRunId: string };
  }>({
    operationName: 'runCoreWorkflowVersion',
    query: RUN_CORE_WORKFLOW_VERSION_MUTATION,
    variables: { input: { coreWorkflowVersionId, payload } },
    token,
  });

  return data.runCoreWorkflowVersion.workflowRunId;
};

export const createDraftFromCoreWorkflowVersion = async ({
  coreWorkflowId,
  coreWorkflowVersionIdToCopy,
  token,
}: {
  coreWorkflowId: string;
  coreWorkflowVersionIdToCopy: string;
  token?: string;
}): Promise<string> => {
  const data = await requestOrThrow<{
    createDraftFromCoreWorkflowVersion: { id: string };
  }>({
    operationName: 'createDraftFromCoreWorkflowVersion',
    query: CREATE_DRAFT_FROM_CORE_WORKFLOW_VERSION_MUTATION,
    variables: { input: { coreWorkflowId, coreWorkflowVersionIdToCopy } },
    token,
  });

  return data.createDraftFromCoreWorkflowVersion.id;
};

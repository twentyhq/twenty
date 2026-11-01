import { randomUUID } from 'node:crypto';

import request from 'supertest';
import { isDefined } from 'twenty-shared/utils';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const client = request(`http://localhost:${APP_PORT}`);

type CoreWorkflowStep = {
  id: string;
  type: string;
  name?: string;
  settings: { input: Record<string, unknown> } & Record<string, unknown>;
  nextStepIds?: string[] | null;
} & Record<string, unknown>;

export type CoreWorkflowVersion<
  TStep extends CoreWorkflowStep = CoreWorkflowStep,
> = {
  id: string;
  coreWorkflowId: string;
  status: string;
  trigger: Record<string, unknown> | null;
  steps: TStep[] | null;
  workspaceWorkflowVersionId: string | null;
};

const CORE_WORKFLOW_VERSION_FIELDS = `
  id
  coreWorkflowId
  status
  trigger
  steps
  workspaceWorkflowVersionId
`;

export const coreWorkflowGraphqlRequest = async <TData>({
  query,
  variables,
  token = APPLE_JANE_ADMIN_ACCESS_TOKEN,
}: {
  query: string;
  variables?: object;
  token?: string;
}): Promise<TData> => {
  const response = await client
    .post('/graphql')
    .set('Authorization', `Bearer ${token}`)
    .send({ query, variables });

  if (response.body.errors) {
    throw new Error(
      `Core workflow request failed: ${JSON.stringify(response.body.errors)}`,
    );
  }

  return response.body.data;
};

export const createCoreWorkflow = async ({
  name,
  token,
}: {
  name: string;
  token?: string;
}): Promise<{
  coreWorkflowId: string;
  coreWorkflowVersionId: string;
  workspaceWorkflowId: string | null;
}> => {
  const { createCoreWorkflow: coreWorkflow } =
    await coreWorkflowGraphqlRequest<{
      createCoreWorkflow: { id: string; workspaceWorkflowId: string | null };
    }>({
      query: `
      mutation CreateCoreWorkflow($input: CreateCoreWorkflowInput!) {
        createCoreWorkflow(input: $input) {
          id
          workspaceWorkflowId
        }
      }
    `,
      variables: { input: { name } },
      token,
    });

  const [draftVersion] = await findCoreWorkflowVersions({
    coreWorkflowId: coreWorkflow.id,
    token,
  });

  return {
    coreWorkflowId: coreWorkflow.id,
    coreWorkflowVersionId: draftVersion.id,
    workspaceWorkflowId: coreWorkflow.workspaceWorkflowId,
  };
};

export const linkCoreWorkflowToLegacyWorkspaceIds = async ({
  coreWorkflowId,
  withWorkspaceRecords = false,
}: {
  coreWorkflowId: string;
  withWorkspaceRecords?: boolean;
}): Promise<{
  workspaceWorkflowId: string;
  workspaceWorkflowVersionIds: string[];
}> => {
  const workspaceSchema = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
  const workspaceWorkflowId = randomUUID();

  await global.testDataSource.query(
    `UPDATE core."workflow" SET "workspaceWorkflowId" = $2 WHERE id = $1`,
    [coreWorkflowId, workspaceWorkflowId],
  );

  if (withWorkspaceRecords) {
    await global.testDataSource.query(
      `INSERT INTO "${workspaceSchema}"."workflow" (id, name, "coreWorkflowId")
       SELECT $1, name, id FROM core."workflow" WHERE id = $2`,
      [workspaceWorkflowId, coreWorkflowId],
    );
  }

  const coreVersions: {
    id: string;
    status: string;
    triggers: object[] | null;
    steps: object[] | null;
  }[] = await global.testDataSource.query(
    `SELECT id, status, triggers, steps FROM core."workflowVersion" WHERE "coreWorkflowId" = $1 ORDER BY "createdAt"`,
    [coreWorkflowId],
  );

  const workspaceWorkflowVersionIds: string[] = [];

  for (const coreVersion of coreVersions) {
    const workspaceWorkflowVersionId = randomUUID();

    await global.testDataSource.query(
      `UPDATE core."workflowVersion" SET "workflowId" = $2, "workspaceWorkflowVersionId" = $3 WHERE id = $1`,
      [coreVersion.id, workspaceWorkflowId, workspaceWorkflowVersionId],
    );

    if (withWorkspaceRecords) {
      await global.testDataSource.query(
        `INSERT INTO "${workspaceSchema}"."workflowVersion" (id, "workflowId", name, status, trigger, steps, "coreWorkflowVersionId")
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          workspaceWorkflowVersionId,
          workspaceWorkflowId,
          `v${workspaceWorkflowVersionIds.length + 1}`,
          coreVersion.status,
          isDefined(coreVersion.triggers?.[0])
            ? JSON.stringify(coreVersion.triggers[0])
            : null,
          isDefined(coreVersion.steps)
            ? JSON.stringify(coreVersion.steps)
            : null,
          coreVersion.id,
        ],
      );
    }

    workspaceWorkflowVersionIds.push(workspaceWorkflowVersionId);
  }

  await global.workflowTestServices.workspaceCache.invalidateAndRecompute(
    SEED_APPLE_WORKSPACE_ID,
    ['flatWorkflowMaps', 'flatWorkflowVersionMaps'],
  );

  return { workspaceWorkflowId, workspaceWorkflowVersionIds };
};

export const deleteLegacyWorkspaceWorkflowRecords = async ({
  workspaceWorkflowId,
}: {
  workspaceWorkflowId: string;
}): Promise<void> => {
  const workspaceSchema = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

  await global.testDataSource.query(
    `DELETE FROM "${workspaceSchema}"."workflowVersion" WHERE "workflowId" = $1`,
    [workspaceWorkflowId],
  );
  await global.testDataSource.query(
    `DELETE FROM "${workspaceSchema}"."workflow" WHERE id = $1`,
    [workspaceWorkflowId],
  );
};

export const findCoreWorkflowVersions = async ({
  coreWorkflowId,
  token,
}: {
  coreWorkflowId: string;
  token?: string;
}): Promise<CoreWorkflowVersion[]> => {
  const { coreWorkflowVersionsByCoreWorkflowId } =
    await coreWorkflowGraphqlRequest<{
      coreWorkflowVersionsByCoreWorkflowId: CoreWorkflowVersion[];
    }>({
      query: `
        query CoreWorkflowVersions($coreWorkflowId: UUID!) {
          coreWorkflowVersionsByCoreWorkflowId(coreWorkflowId: $coreWorkflowId) {
            ${CORE_WORKFLOW_VERSION_FIELDS}
          }
        }
      `,
      variables: { coreWorkflowId },
      token,
    });

  return coreWorkflowVersionsByCoreWorkflowId;
};

export const findCoreWorkflowVersion = async <
  TStep extends CoreWorkflowStep = CoreWorkflowStep,
>({
  coreWorkflowVersionId,
  token,
}: {
  coreWorkflowVersionId: string;
  token?: string;
}): Promise<CoreWorkflowVersion<TStep>> => {
  const { coreWorkflowVersionById } = await coreWorkflowGraphqlRequest<{
    coreWorkflowVersionById: CoreWorkflowVersion<TStep>;
  }>({
    query: `
      query CoreWorkflowVersion($coreWorkflowVersionId: UUID!) {
        coreWorkflowVersionById(coreWorkflowVersionId: $coreWorkflowVersionId) {
          ${CORE_WORKFLOW_VERSION_FIELDS}
        }
      }
    `,
    variables: { coreWorkflowVersionId },
    token,
  });

  return coreWorkflowVersionById;
};

export const updateCoreWorkflowVersionTrigger = async ({
  coreWorkflowVersionId,
  trigger,
  token,
}: {
  coreWorkflowVersionId: string;
  trigger: object;
  token?: string;
}): Promise<void> => {
  await coreWorkflowGraphqlRequest({
    query: `
      mutation UpdateCoreWorkflowVersionTrigger(
        $input: UpdateCoreWorkflowVersionTriggerInput!
      ) {
        updateCoreWorkflowVersionTrigger(input: $input) {
          trigger
        }
      }
    `,
    variables: { input: { coreWorkflowVersionId, trigger } },
    token,
  });
};

export const createCoreWorkflowVersionStep = async <
  TStep extends CoreWorkflowStep = CoreWorkflowStep,
>({
  coreWorkflowVersionId,
  stepType,
  parentStepId = 'trigger',
  position = { x: 200, y: 0 },
  token,
  ...rest
}: {
  coreWorkflowVersionId: string;
  stepType: string;
  parentStepId?: string;
  position?: { x: number; y: number };
  token?: string;
  id?: string;
  nextStepId?: string;
  parentStepConnectionOptions?: object;
  defaultSettings?: object;
}): Promise<TStep> => {
  const { steps: previousSteps } = await findCoreWorkflowVersion({
    coreWorkflowVersionId,
    token,
  });
  const previousStepIds = new Set((previousSteps ?? []).map((step) => step.id));

  await coreWorkflowGraphqlRequest({
    query: `
      mutation CreateCoreWorkflowVersionStep(
        $input: CreateCoreWorkflowVersionStepInput!
      ) {
        createCoreWorkflowVersionStep(input: $input) {
          stepsDiff
        }
      }
    `,
    variables: {
      input: {
        coreWorkflowVersionId,
        stepType,
        parentStepId,
        position,
        ...rest,
      },
    },
    token,
  });

  const { steps } = await findCoreWorkflowVersion<TStep>({
    coreWorkflowVersionId,
    token,
  });

  const createdStep = (steps ?? []).find((step) =>
    isDefined(rest.id)
      ? step.id === rest.id
      : step.type === stepType && !previousStepIds.has(step.id),
  );

  if (!isDefined(createdStep)) {
    throw new Error(`Step of type ${stepType} was not created`);
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
  await coreWorkflowGraphqlRequest({
    query: `
      mutation UpdateCoreWorkflowVersionStep(
        $input: UpdateCoreWorkflowVersionStepInput!
      ) {
        updateCoreWorkflowVersionStep(input: $input) {
          id
        }
      }
    `,
    variables: { input: { coreWorkflowVersionId, step } },
    token,
  });
};

export const activateCoreWorkflowVersion = async ({
  coreWorkflowVersionId,
  token,
}: {
  coreWorkflowVersionId: string;
  token?: string;
}): Promise<void> => {
  await coreWorkflowGraphqlRequest({
    query: `
      mutation ActivateCoreWorkflowVersion($coreWorkflowVersionId: UUID!) {
        activateCoreWorkflowVersion(coreWorkflowVersionId: $coreWorkflowVersionId)
      }
    `,
    variables: { coreWorkflowVersionId },
    token,
  });
};

export const createDraftFromCoreWorkflowVersion = async ({
  coreWorkflowId,
  coreWorkflowVersionIdToCopy,
  token,
}: {
  coreWorkflowId: string;
  coreWorkflowVersionIdToCopy: string;
  token?: string;
}): Promise<{ id: string }> => {
  const { createDraftFromCoreWorkflowVersion: draft } =
    await coreWorkflowGraphqlRequest<{
      createDraftFromCoreWorkflowVersion: { id: string };
    }>({
      query: `
        mutation CreateDraftFromCoreWorkflowVersion(
          $input: CreateDraftFromCoreWorkflowVersionInput!
        ) {
          createDraftFromCoreWorkflowVersion(input: $input) {
            id
          }
        }
      `,
      variables: { input: { coreWorkflowId, coreWorkflowVersionIdToCopy } },
      token,
    });

  return draft;
};

export const deactivateCoreWorkflowVersion = async ({
  coreWorkflowVersionId,
  token,
}: {
  coreWorkflowVersionId: string;
  token?: string;
}): Promise<void> => {
  await coreWorkflowGraphqlRequest({
    query: `
      mutation DeactivateCoreWorkflowVersion($coreWorkflowVersionId: UUID!) {
        deactivateCoreWorkflowVersion(
          coreWorkflowVersionId: $coreWorkflowVersionId
        )
      }
    `,
    variables: { coreWorkflowVersionId },
    token,
  });
};

export const runCoreWorkflowVersion = async ({
  coreWorkflowVersionId,
  payload,
  workflowRunId,
  token,
}: {
  coreWorkflowVersionId: string;
  payload?: object;
  workflowRunId?: string;
  token?: string;
}): Promise<string> => {
  const { runCoreWorkflowVersion: runResult } =
    await coreWorkflowGraphqlRequest<{
      runCoreWorkflowVersion: { workflowRunId: string };
    }>({
      query: `
        mutation RunCoreWorkflowVersion($input: RunCoreWorkflowVersionInput!) {
          runCoreWorkflowVersion(input: $input) {
            workflowRunId
          }
        }
      `,
      variables: { input: { coreWorkflowVersionId, payload, workflowRunId } },
      token,
    });

  return runResult.workflowRunId;
};

export const deleteCoreWorkflows = async ({
  coreWorkflowIds,
  token,
}: {
  coreWorkflowIds: string[];
  token?: string;
}): Promise<void> => {
  await coreWorkflowGraphqlRequest({
    query: `
      mutation DeleteCoreWorkflows($input: DeleteCoreWorkflowsInput!) {
        deleteCoreWorkflows(input: $input) {
          id
        }
      }
    `,
    variables: { input: { coreWorkflowIds } },
    token,
  });
};

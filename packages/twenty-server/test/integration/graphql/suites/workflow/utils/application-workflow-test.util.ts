import { randomUUID } from 'node:crypto';

import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import {
  getWorkflowVersionUniversalIdentifier,
  type Manifest,
} from 'twenty-shared/application';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

type WorkflowStepManifest = NonNullable<
  Manifest['workflows']
>[number]['version']['steps'][number];

type WorkflowStepManifestWithoutEdges = WorkflowStepManifest extends unknown
  ? Omit<WorkflowStepManifest, 'universalIdentifier' | 'nextStepIds'>
  : never;

export type TestApplicationWorkflow = {
  universalIdentifier: string;
  triggerUniversalIdentifier: string;
  name: string;
  steps: WorkflowStepManifest[];
};

export type TestWorkflowRun = {
  id: string;
  status: WorkflowRunStatus;
  state: {
    stepInfos: Record<
      string,
      { status: string; error?: string; result?: Record<string, unknown> }
    >;
    workflowRunError?: string;
  };
};

export const buildTestApplicationWorkflow = (
  name: string,
  steps: WorkflowStepManifestWithoutEdges[],
): TestApplicationWorkflow => {
  const stepIds = steps.map(() => randomUUID());

  return {
    universalIdentifier: randomUUID(),
    triggerUniversalIdentifier: randomUUID(),
    name,
    steps: steps.map(
      (step, index) =>
        ({
          ...step,
          universalIdentifier: stepIds[index],
          nextStepIds: index + 1 < stepIds.length ? [stepIds[index + 1]] : [],
        }) as WorkflowStepManifest,
    ),
  };
};

export const createCompanyStep = (
  companyName: string,
): WorkflowStepManifestWithoutEdges =>
  ({
    name: 'Create company',
    type: 'CREATE_RECORD',
    input: {
      objectUniversalIdentifier: STANDARD_OBJECTS.company.universalIdentifier,
      objectRecord: { name: companyName },
    },
  }) as WorkflowStepManifestWithoutEdges;

export const formStep = (): WorkflowStepManifestWithoutEdges =>
  ({
    name: 'Ask a note',
    type: 'FORM',
    input: [{ id: randomUUID(), name: 'note', label: 'Note', type: 'TEXT' }],
  }) as WorkflowStepManifestWithoutEdges;

export const logicFunctionStep = (
  logicFunctionUniversalIdentifier: string,
): WorkflowStepManifestWithoutEdges =>
  ({
    name: 'Call the application function',
    type: 'LOGIC_FUNCTION',
    logicFunctionUniversalIdentifier,
    input: {},
  }) as WorkflowStepManifestWithoutEdges;

export const buildTestApplicationManifest = ({
  applicationUniversalIdentifier,
  roleUniversalIdentifier,
  companyPermissionUniversalIdentifier,
  logicFunctionUniversalIdentifier,
  workflows,
}: {
  applicationUniversalIdentifier: string;
  roleUniversalIdentifier: string;
  companyPermissionUniversalIdentifier: string;
  logicFunctionUniversalIdentifier: string;
  workflows: TestApplicationWorkflow[];
}): Manifest =>
  buildBaseManifest({
    appId: applicationUniversalIdentifier,
    roleId: roleUniversalIdentifier,
    overrides: {
      roles: [
        {
          universalIdentifier: roleUniversalIdentifier,
          label: 'Application workflow test role',
          description: 'Role the application workflows run with',
          canUpdateAllSettings: false,
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
          objectPermissions: [
            {
              universalIdentifier: companyPermissionUniversalIdentifier,
              objectUniversalIdentifier:
                STANDARD_OBJECTS.company.universalIdentifier,
              canReadObjectRecords: true,
              canUpdateObjectRecords: true,
            },
          ],
          permissionFlagUniversalIdentifiers: [SystemPermissionFlag.WORKFLOWS],
        },
      ],
      logicFunctions: [
        {
          universalIdentifier: logicFunctionUniversalIdentifier,
          name: 'Application workflow test function',
          sourceHandlerPath: 'greet.ts',
          builtHandlerPath: 'greet.mjs',
          builtHandlerChecksum: '',
          handlerName: 'handler',
          workflowActionTriggerSettings: {
            label: 'Greet',
            icon: 'IconHandStop',
          },
        },
      ],
      workflows: workflows.map((workflow) => ({
        universalIdentifier: workflow.universalIdentifier,
        name: workflow.name,
        version: {
          trigger: {
            universalIdentifier: workflow.triggerUniversalIdentifier,
            type: 'MANUAL',
            nextStepIds: [workflow.steps[0].universalIdentifier],
          },
          steps: workflow.steps,
        },
      })),
    },
  });

export const findTestWorkflowVersionId = async ({
  applicationUniversalIdentifier,
  workflow,
}: {
  applicationUniversalIdentifier: string;
  workflow: TestApplicationWorkflow;
}): Promise<string | undefined> => {
  const [version] = await globalThis.testDataSource.query(
    `SELECT id FROM core."workflowVersion"
     WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
    [
      SEED_APPLE_WORKSPACE_ID,
      getWorkflowVersionUniversalIdentifier({
        applicationUniversalIdentifier,
        workflowUniversalIdentifier: workflow.universalIdentifier,
      }),
    ],
  );

  return version?.id;
};

export const countCoreWorkflows = async (
  workflow: TestApplicationWorkflow,
): Promise<number> => {
  const [{ count }] = await globalThis.testDataSource.query(
    `SELECT COUNT(*)::int AS count FROM core.workflow
     WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
    [SEED_APPLE_WORKSPACE_ID, workflow.universalIdentifier],
  );

  return count;
};

export const runCoreWorkflowVersion = (coreWorkflowVersionId: string) =>
  workflowGraphqlRequest(
    'mutation Run($input: RunCoreWorkflowVersionInput!) { runCoreWorkflowVersion(input: $input) { workflowRunId } }',
    { input: { coreWorkflowVersionId } },
  );

const findTestWorkflowRun = async (
  workflowRunId: string,
): Promise<TestWorkflowRun> => {
  const [workflowRun] = await globalThis.testDataSource.query(
    `SELECT id, status, state FROM "${SCHEMA}"."workflowRun" WHERE id = $1`,
    [workflowRunId],
  );

  return workflowRun;
};

export const waitForTestWorkflowRun = async (
  workflowRunId: string,
  isDone: (workflowRun: TestWorkflowRun) => boolean,
): Promise<TestWorkflowRun> => {
  for (let attempt = 0; attempt < 600; attempt++) {
    const workflowRun = await findTestWorkflowRun(workflowRunId);

    if (isDone(workflowRun)) {
      return workflowRun;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return findTestWorkflowRun(workflowRunId);
};

export const countTestCompanies = async (name: string): Promise<number> => {
  const [{ count }] = await globalThis.testDataSource.query(
    `SELECT COUNT(*)::int AS count FROM "${SCHEMA}"."company"
     WHERE name = $1 AND "deletedAt" IS NULL`,
    [name],
  );

  return count;
};

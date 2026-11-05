import { randomUUID } from 'node:crypto';

import request from 'supertest';
import {
  createCoreWorkflow,
  deleteCoreWorkflows,
  linkCoreWorkflowToLegacyWorkspaceIds,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { submitFormStep } from 'test/integration/graphql/suites/workflow/utils/submit-form-step.util';
import { runWorkflowActionStep } from 'test/integration/graphql/suites/workflow/utils/run-workflow-action-step.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import {
  getWorkflowVersionUniversalIdentifier,
  type Manifest,
} from 'twenty-shared/application';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { WorkflowVisibility } from 'twenty-shared/types';

import { type LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
const RUN_PREFIX = `App workflow permissions ${randomUUID()}`;

const APP_ID = randomUUID();
const ROLE_ID = randomUUID();
const COMPANY_PERMISSION_ID = randomUUID();
const FUNCTION_ID = randomUUID();
const OTHER_APP_ID = randomUUID();
const OTHER_ROLE_ID = randomUUID();

const COMPANY_NAME = `${RUN_PREFIX} company`;
const DELAYED_COMPANY_NAME = `${RUN_PREFIX} delayed company`;
const OPPORTUNITY_NAME = `${RUN_PREFIX} opportunity`;
const WORKSPACE_OPPORTUNITY_NAME = `${RUN_PREFIX} workspace opportunity`;
const NESTED_OPPORTUNITY_NAME = `${RUN_PREFIX} nested opportunity`;

type WorkflowStepManifest = NonNullable<
  Manifest['workflows']
>[number]['version']['steps'][number];

type WithoutEdges<TStep> = TStep extends unknown
  ? Omit<TStep, 'universalIdentifier' | 'nextStepIds'>
  : never;

type WorkflowStepManifestWithoutEdges = WithoutEdges<WorkflowStepManifest>;

type TestWorkflow = {
  universalIdentifier: string;
  steps: WorkflowStepManifest[];
};

const buildTestWorkflow = (
  steps: WorkflowStepManifestWithoutEdges[],
): TestWorkflow => {
  const stepIds = steps.map(() => randomUUID());

  return {
    universalIdentifier: randomUUID(),
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

const CREATE_COMPANY_WORKFLOW = buildTestWorkflow([
  {
    name: 'Create company',
    type: 'CREATE_RECORD',
    input: {
      objectUniversalIdentifier: STANDARD_OBJECTS.company.universalIdentifier,
      objectRecord: { name: COMPANY_NAME },
    },
  } as WorkflowStepManifestWithoutEdges,
]);

const CREATE_OPPORTUNITY_WORKFLOW = buildTestWorkflow([
  {
    name: 'Create opportunity',
    type: 'CREATE_RECORD',
    input: {
      objectUniversalIdentifier:
        STANDARD_OBJECTS.opportunity.universalIdentifier,
      objectRecord: { name: OPPORTUNITY_NAME },
    },
  } as WorkflowStepManifestWithoutEdges,
]);

const LOGIC_FUNCTION_WORKFLOW = buildTestWorkflow([
  {
    name: 'Call the application function',
    type: 'LOGIC_FUNCTION',
    logicFunctionUniversalIdentifier: FUNCTION_ID,
    input: { greeting: 'Hello' },
  } as WorkflowStepManifestWithoutEdges,
]);

const DELAYED_CREATE_COMPANY_WORKFLOW = buildTestWorkflow([
  {
    name: 'Wait',
    type: 'DELAY',
    input: { delayType: 'DURATION', duration: { seconds: 10 } },
  } as WorkflowStepManifestWithoutEdges,
  {
    name: 'Create company after the delay',
    type: 'CREATE_RECORD',
    input: {
      objectUniversalIdentifier: STANDARD_OBJECTS.company.universalIdentifier,
      objectRecord: { name: DELAYED_COMPANY_NAME },
    },
  } as WorkflowStepManifestWithoutEdges,
]);

const FORM_WORKFLOW = buildTestWorkflow([
  {
    name: 'Pick records',
    type: 'FORM',
    input: [
      {
        id: randomUUID(),
        name: 'company',
        label: 'Company',
        type: 'RECORD',
        settings: {
          objectUniversalIdentifier:
            STANDARD_OBJECTS.company.universalIdentifier,
        },
      },
      {
        id: randomUUID(),
        name: 'opportunity',
        label: 'Opportunity',
        type: 'RECORD',
        settings: {
          objectUniversalIdentifier:
            STANDARD_OBJECTS.opportunity.universalIdentifier,
        },
      },
    ],
  } as WorkflowStepManifestWithoutEdges,
]);

const DRAFT_EMAIL_WORKFLOW = buildTestWorkflow([
  {
    name: 'Draft an email',
    type: 'DRAFT_EMAIL',
    input: {
      connectedAccountId: randomUUID(),
      recipients: { to: 'jane@example.com', cc: '', bcc: '' },
      subject: `${RUN_PREFIX} draft`,
    },
  } as WorkflowStepManifestWithoutEdges,
]);

const TEST_WORKFLOWS = [
  CREATE_COMPANY_WORKFLOW,
  CREATE_OPPORTUNITY_WORKFLOW,
  LOGIC_FUNCTION_WORKFLOW,
  DELAYED_CREATE_COMPANY_WORKFLOW,
  FORM_WORKFLOW,
  DRAFT_EMAIL_WORKFLOW,
];

const buildManifest = ({
  canManageCompanies,
  canSendEmail = false,
}: {
  canManageCompanies: boolean;
  canSendEmail?: boolean;
}): Manifest =>
  buildBaseManifest({
    appId: APP_ID,
    roleId: ROLE_ID,
    overrides: {
      roles: [
        {
          universalIdentifier: ROLE_ID,
          label: 'Application workflow role',
          description: 'Role the application workflows run with',
          canUpdateAllSettings: false,
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
          objectPermissions: canManageCompanies
            ? [
                {
                  universalIdentifier: COMPANY_PERMISSION_ID,
                  objectUniversalIdentifier:
                    STANDARD_OBJECTS.company.universalIdentifier,
                  canReadObjectRecords: true,
                  canUpdateObjectRecords: true,
                },
              ]
            : [],
          permissionFlagUniversalIdentifiers: [
            SystemPermissionFlag.WORKFLOWS,
            ...(canSendEmail ? [SystemPermissionFlag.SEND_EMAIL_TOOL] : []),
          ],
        },
      ],
      logicFunctions: [
        {
          universalIdentifier: FUNCTION_ID,
          name: 'Application workflow permissions function',
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
      workflows: TEST_WORKFLOWS.map((workflow, index) => ({
        universalIdentifier: workflow.universalIdentifier,
        name: `${RUN_PREFIX} ${index}`,
        version: {
          trigger: {
            universalIdentifier: randomUUID(),
            type: 'MANUAL',
            nextStepIds: [workflow.steps[0].universalIdentifier],
          },
          steps: workflow.steps,
        },
      })),
    },
  });

const OTHER_APPLICATION_MANIFEST = buildBaseManifest({
  appId: OTHER_APP_ID,
  roleId: OTHER_ROLE_ID,
  overrides: {
    roles: [
      {
        universalIdentifier: OTHER_ROLE_ID,
        label: 'Other application role',
        description: 'Role of an application that owns no workflow',
        canUpdateAllSettings: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        permissionFlagUniversalIdentifiers: [SystemPermissionFlag.WORKFLOWS],
      },
    ],
  },
});

const RUN_CORE_WORKFLOW_VERSION = `
  mutation RunCoreWorkflowVersion($input: RunCoreWorkflowVersionInput!) {
    runCoreWorkflowVersion(input: $input) {
      workflowRunId
    }
  }
`;

const UPDATE_WORKFLOW_RUN_STEP = `
  mutation UpdateWorkflowRunStep($input: UpdateWorkflowRunStepInput!) {
    updateWorkflowRunStep(input: $input) {
      id
    }
  }
`;

const CORE_WORKFLOWS = `
  query CoreWorkflows($filter: CoreWorkflowFilterInput) {
    coreWorkflows(first: 200, filter: $filter) {
      edges {
        node {
          id
        }
      }
      totalCount
    }
  }
`;

const CORE_WORKFLOW_READS = `
  query CoreWorkflowReads($coreWorkflowId: UUID!, $coreWorkflowVersionId: UUID!) {
    coreWorkflowById(coreWorkflowId: $coreWorkflowId) {
      id
    }
    coreWorkflowsWithCurrentVersions(input: { coreWorkflowIds: [$coreWorkflowId] }) {
      workflow {
        id
      }
    }
    coreWorkflowVersionsByCoreWorkflowId(coreWorkflowId: $coreWorkflowId) {
      id
    }
    coreWorkflowVersionById(coreWorkflowVersionId: $coreWorkflowVersionId) {
      id
      steps
    }
  }
`;

const LEGACY_CORE_WORKFLOW_READS = `
  query LegacyCoreWorkflowReads(
    $workspaceWorkflowId: UUID!
    $workspaceWorkflowVersionId: UUID!
  ) {
    coreWorkflow(workspaceWorkflowId: $workspaceWorkflowId) {
      id
    }
    coreWorkflowVersions(workspaceWorkflowId: $workspaceWorkflowId) {
      id
    }
    coreWorkflowVersion(workspaceWorkflowVersionId: $workspaceWorkflowVersionId) {
      id
      steps
    }
  }
`;

const UPDATE_CORE_WORKFLOW_VISIBILITY = `
  mutation UpdateCoreWorkflowVisibility(
    $input: UpdateCoreWorkflowVisibilityInput!
  ) {
    updateCoreWorkflowVisibility(input: $input) {
      id
    }
  }
`;

const COMPUTE_STEP_OUTPUT_SCHEMA = `
  mutation ComputeStepOutputSchema($input: ComputeStepOutputSchemaInput!) {
    computeStepOutputSchema(input: $input)
  }
`;

const RUN_PREFIX_FILTER = {
  logicalOperator: 'AND',
  rules: [{ fieldKey: 'NAME', operand: 'CONTAINS', value: RUN_PREFIX }],
};

const graphqlAs = (token: string, query: string, variables?: object) =>
  request(`http://localhost:${APP_PORT}`)
    .post('/graphql')
    .set('Authorization', `Bearer ${token}`)
    .send({ query, variables });

const findApplicationId = async (
  applicationUniversalIdentifier: string,
): Promise<string> => {
  const [{ id }] = await globalThis.testDataSource.query(
    `SELECT id FROM core.application WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
    [applicationUniversalIdentifier, SEED_APPLE_WORKSPACE_ID],
  );

  return id;
};

const buildJaneTokenThroughApplication = async (
  applicationUniversalIdentifier: string,
): Promise<string> => {
  const { applicationAccessToken } = await generateApplicationTokenPair({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    applicationId: await findApplicationId(applicationUniversalIdentifier),
    userId: USER_DATA_SEED_IDS.JANE,
    userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
  });

  return applicationAccessToken.token;
};

const buildTimTokenThroughApplication = async (
  applicationUniversalIdentifier: string,
): Promise<string> => {
  const { applicationAccessToken } = await generateApplicationTokenPair({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    applicationId: await findApplicationId(applicationUniversalIdentifier),
    userId: USER_DATA_SEED_IDS.TIM,
    userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
  });

  return applicationAccessToken.token;
};

const buildApplicationTokenWithoutUser = async (
  applicationUniversalIdentifier: string,
): Promise<string> => {
  const { applicationAccessToken } = await generateApplicationTokenPair({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    applicationId: await findApplicationId(applicationUniversalIdentifier),
  });

  return applicationAccessToken.token;
};

const listCoreWorkflowIds = async (
  token: string,
  filter?: object,
): Promise<{ totalCount: number; coreWorkflowIds: string[] }> => {
  const response = await graphqlAs(token, CORE_WORKFLOWS, { filter });

  expect(response.body.errors).toBeUndefined();

  const { edges, totalCount } = response.body.data.coreWorkflows;

  return {
    totalCount,
    coreWorkflowIds: edges.map(({ node }: { node: { id: string } }) => node.id),
  };
};

const readCoreWorkflow = async (
  token: string,
  variables: { coreWorkflowId: string; coreWorkflowVersionId: string },
) => {
  const response = await graphqlAs(token, CORE_WORKFLOW_READS, variables);

  expect(response.body.errors).toBeUndefined();

  return response.body.data;
};

type MemberWorkflow = {
  coreWorkflowId: string;
  coreWorkflowVersionId: string;
  workspaceWorkflowId: string;
  workspaceWorkflowVersionId: string;
};

const findVersionId = async (workflow: TestWorkflow): Promise<string> => {
  const [version] = await globalThis.testDataSource.query(
    `SELECT id FROM core."workflowVersion"
     WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
    [
      SEED_APPLE_WORKSPACE_ID,
      getWorkflowVersionUniversalIdentifier({
        applicationUniversalIdentifier: APP_ID,
        workflowUniversalIdentifier: workflow.universalIdentifier,
      }),
    ],
  );

  return version.id;
};

const findApplicationWorkflow = async (
  workflow: TestWorkflow,
): Promise<{ coreWorkflowId: string; coreWorkflowVersionId: string }> => {
  const [{ id }] = await globalThis.testDataSource.query(
    `SELECT id FROM core.workflow
     WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
    [SEED_APPLE_WORKSPACE_ID, workflow.universalIdentifier],
  );

  return {
    coreWorkflowId: id,
    coreWorkflowVersionId: await findVersionId(workflow),
  };
};

const runWorkflow = async (workflow: TestWorkflow): Promise<string> => {
  const response = await workflowGraphqlRequest(RUN_CORE_WORKFLOW_VERSION, {
    input: { coreWorkflowVersionId: await findVersionId(workflow) },
  });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.runCoreWorkflowVersion.workflowRunId;
};

type TestWorkflowRun = {
  status: string;
  state: {
    flow?: {
      steps: {
        id: string;
        name: string;
        settings: { input: Record<string, unknown>[] };
      }[];
    };
    stepInfos: Record<
      string,
      { status: string; error?: string; result?: Record<string, unknown> }
    >;
  };
};

const findRun = async (workflowRunId: string): Promise<TestWorkflowRun> => {
  const [workflowRun] = await globalThis.testDataSource.query(
    `SELECT status, state FROM "${SCHEMA}"."workflowRun" WHERE id = $1`,
    [workflowRunId],
  );

  return workflowRun;
};

const waitForRun = async (
  workflowRunId: string,
  isDone: (workflowRun: TestWorkflowRun) => boolean,
): Promise<TestWorkflowRun> => {
  for (let attempt = 0; attempt < 600; attempt++) {
    const workflowRun = await findRun(workflowRunId);

    if (isDone(workflowRun)) {
      return workflowRun;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return findRun(workflowRunId);
};

const waitForRunToEnd = (workflowRunId: string) =>
  waitForRun(workflowRunId, ({ status }) =>
    ['COMPLETED', 'FAILED', 'STOPPED'].includes(status),
  );

const countRecordsByName = async (
  objectTable: 'company' | 'opportunity',
  name: string,
): Promise<number> => {
  const [{ count }] = await globalThis.testDataSource.query(
    `SELECT COUNT(*)::int AS count FROM "${SCHEMA}"."${objectTable}"
     WHERE name = $1 AND "deletedAt" IS NULL`,
    [name],
  );

  return count;
};

describe('application workflow execution permissions', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_ID,
      name: 'Application workflow permissions',
      description: 'Application whose workflows run with its role',
      sourcePath: 'application-workflow-permissions',
    });
    await setupApplicationForSync({
      applicationUniversalIdentifier: OTHER_APP_ID,
      name: 'Other application',
      description: 'Application that tries to start another one workflows',
      sourcePath: 'application-workflow-permissions-other',
    });
    jest.useRealTimers();

    const installation = await syncApplication({
      manifest: buildManifest({ canManageCompanies: true }),
    });

    expect(installation.errors).toBeUndefined();

    const otherInstallation = await syncApplication({
      manifest: OTHER_APPLICATION_MANIFEST,
    });

    expect(otherInstallation.errors).toBeUndefined();
  }, 120000);

  afterAll(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM "${SCHEMA}"."workflowRun" WHERE "coreWorkflowId" IN (
         SELECT id FROM core.workflow
         WHERE "workspaceId" = $1 AND "universalIdentifier" = ANY($2)
       )`,
      [
        SEED_APPLE_WORKSPACE_ID,
        TEST_WORKFLOWS.map(({ universalIdentifier }) => universalIdentifier),
      ],
    );
    await globalThis.testDataSource.query(
      `DELETE FROM "${SCHEMA}"."company" WHERE name LIKE $1`,
      [`${RUN_PREFIX}%`],
    );
    await globalThis.testDataSource.query(
      `DELETE FROM "${SCHEMA}"."opportunity" WHERE name LIKE $1`,
      [`${RUN_PREFIX}%`],
    );
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_ID,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: OTHER_APP_ID,
    });
  });

  it('runs a record step the application role allows', async () => {
    const workflowRun = await waitForRunToEnd(
      await runWorkflow(CREATE_COMPANY_WORKFLOW),
    );

    expect(workflowRun.status).toBe('COMPLETED');
    expect(await countRecordsByName('company', COMPANY_NAME)).toBe(1);
  }, 120000);

  it('refuses a record step the application role does not allow, even for an admin', async () => {
    const workflowRun = await waitForRunToEnd(
      await runWorkflow(CREATE_OPPORTUNITY_WORKFLOW),
    );
    const [createStep] = CREATE_OPPORTUNITY_WORKFLOW.steps;

    expect(workflowRun.status).toBe('FAILED');
    expect(
      workflowRun.state.stepInfos[createStep.universalIdentifier].status,
    ).toBe('FAILED');
    expect(await countRecordsByName('opportunity', OPPORTUNITY_NAME)).toBe(0);
  }, 120000);

  it('keeps running workspace workflows with the permissions of the member who started them', async () => {
    const { status, stepStatus } = await runWorkflowActionStep({
      name: `${RUN_PREFIX} workspace workflow`,
      stepType: 'CREATE_RECORD',
      input: {
        objectName: 'opportunity',
        objectRecord: { name: WORKSPACE_OPPORTUNITY_NAME },
      },
    });

    expect(status).toBe('COMPLETED');
    expect(stepStatus).toBe('SUCCESS');
    expect(
      await countRecordsByName('opportunity', WORKSPACE_OPPORTUNITY_NAME),
    ).toBe(1);
  }, 120000);

  it('runs the application function for the member who started the run', async () => {
    const executeSpy = jest
      .spyOn(
        getAppProviderByClassName<LogicFunctionExecutorService>(
          'LogicFunctionExecutorService',
        ),
        'execute',
      )
      .mockResolvedValue({
        data: { greeted: true },
        duration: 1,
        billedDurationMs: 1,
        logs: '',
        status: LogicFunctionExecutionStatus.SUCCESS,
      });

    try {
      const workflowRun = await waitForRunToEnd(
        await runWorkflow(LOGIC_FUNCTION_WORKFLOW),
      );

      expect(workflowRun.status).toBe('COMPLETED');
      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
        }),
      );
    } finally {
      executeSpy.mockRestore();
    }
  }, 120000);

  it('only lets an application token start that application workflows', async () => {
    const coreWorkflowVersionId = await findVersionId(CREATE_COMPANY_WORKFLOW);

    const crossApplicationStart = await graphqlAs(
      await buildJaneTokenThroughApplication(OTHER_APP_ID),
      RUN_CORE_WORKFLOW_VERSION,
      { input: { coreWorkflowVersionId } },
    );

    expect(crossApplicationStart.body.errors?.[0]?.message).toContain(
      'cannot start a workflow owned by another application',
    );

    const ownApplicationStart = await graphqlAs(
      await buildJaneTokenThroughApplication(APP_ID),
      RUN_CORE_WORKFLOW_VERSION,
      { input: { coreWorkflowVersionId } },
    );

    expect(ownApplicationStart.body.errors).toBeUndefined();

    const ownApplicationRun = await waitForRunToEnd(
      ownApplicationStart.body.data.runCoreWorkflowVersion.workflowRunId,
    );

    expect(ownApplicationRun.status).toBe('COMPLETED');
  }, 120000);

  it('refuses an application token starting a workspace workflow', async () => {
    await expect(
      runWorkflowActionStep({
        name: `${RUN_PREFIX} workspace workflow started by the application`,
        stepType: 'CREATE_RECORD',
        input: {
          objectName: 'opportunity',
          objectRecord: { name: NESTED_OPPORTUNITY_NAME },
        },
        runToken: await buildJaneTokenThroughApplication(APP_ID),
      }),
    ).rejects.toThrow('cannot start a workflow owned by another application');
    expect(
      await countRecordsByName('opportunity', NESTED_OPPORTUNITY_NAME),
    ).toBe(0);
  }, 120000);

  it('only lets the values of a form step change on an application workflow run, and not through the application', async () => {
    const workflowRunId = await runWorkflow(FORM_WORKFLOW);
    const [formStep] = FORM_WORKFLOW.steps;

    const pendingRun = await waitForRun(
      workflowRunId,
      ({ state }) =>
        state?.stepInfos?.[formStep.universalIdentifier]?.status === 'PENDING',
    );
    const runFormStep = pendingRun.state.flow?.steps.find(
      ({ id }) => id === formStep.universalIdentifier,
    );

    expect(runFormStep).toBeDefined();

    const renamedStep = await workflowGraphqlRequest(UPDATE_WORKFLOW_RUN_STEP, {
      input: { workflowRunId, step: { ...runFormStep, name: 'Renamed' } },
    });

    expect(renamedStep.body.errors?.[0]?.message).toContain(
      'Only the values of a form step can change',
    );

    const filledStep = await workflowGraphqlRequest(UPDATE_WORKFLOW_RUN_STEP, {
      input: {
        workflowRunId,
        step: {
          ...runFormStep,
          settings: {
            ...runFormStep?.settings,
            input: runFormStep?.settings.input.map((field) => ({
              ...field,
              value: null,
            })),
          },
        },
      },
    });

    expect(filledStep.body.errors).toBeUndefined();

    const stepFilledThroughApplication = await graphqlAs(
      await buildJaneTokenThroughApplication(APP_ID),
      UPDATE_WORKFLOW_RUN_STEP,
      { input: { workflowRunId, step: runFormStep } },
    );

    expect(
      stepFilledThroughApplication.body.errors?.[0]?.extensions?.code,
    ).toBe('FORBIDDEN');
  }, 120000);

  it('reads the records picked in a form with the permissions of the run, keeping a refused form open', async () => {
    const [formStep] = FORM_WORKFLOW.steps;

    const [opportunity] = await globalThis.testDataSource.query(
      `SELECT id FROM "${SCHEMA}"."opportunity" WHERE "deletedAt" IS NULL LIMIT 1`,
    );
    const [company] = await globalThis.testDataSource.query(
      `SELECT id FROM "${SCHEMA}"."company" WHERE "deletedAt" IS NULL LIMIT 1`,
    );

    const formRunId = await runWorkflow(FORM_WORKFLOW);

    await waitForRun(
      formRunId,
      ({ state }) =>
        state?.stepInfos?.[formStep.universalIdentifier]?.status === 'PENDING',
    );

    const unreadableSelection = await submitFormStep({
      workflowRunId: formRunId,
      stepId: formStep.universalIdentifier,
      response: { opportunity: { id: opportunity.id } },
    });

    expect(unreadableSelection.body.errors).toBeDefined();
    expect(
      (await findRun(formRunId)).state.stepInfos[formStep.universalIdentifier]
        .status,
    ).toBe('PENDING');

    const malformedSelection = await submitFormStep({
      workflowRunId: formRunId,
      stepId: formStep.universalIdentifier,
      response: { company: { id: 'not-a-record-id' } },
    });

    expect(malformedSelection.body.errors).toBeDefined();

    const readableSelection = await submitFormStep({
      workflowRunId: formRunId,
      stepId: formStep.universalIdentifier,
      response: { company: { id: company.id } },
    });

    expect(readableSelection.body.errors).toBeUndefined();

    const workflowRun = await waitForRunToEnd(formRunId);

    expect(workflowRun.status).toBe('COMPLETED');
    expect(
      workflowRun.state.stepInfos[formStep.universalIdentifier].result,
    ).toMatchObject({ company: { id: company.id } });
    expect(
      workflowRun.state.stepInfos[formStep.universalIdentifier].result,
    ).not.toHaveProperty('opportunity');
  }, 120000);

  it('refuses an email step when the application role lacks the send email permission', async () => {
    const workflowRun = await waitForRunToEnd(
      await runWorkflow(DRAFT_EMAIL_WORKFLOW),
    );
    const [draftStep] = DRAFT_EMAIL_WORKFLOW.steps;
    const draftStepInfo =
      workflowRun.state.stepInfos[draftStep.universalIdentifier];

    expect(workflowRun.status).toBe('FAILED');
    expect(draftStepInfo.status).toBe('FAILED');
    expect(draftStepInfo.error).toContain(
      'This application needs the SEND_EMAIL_TOOL permission to run DRAFT_EMAIL steps',
    );
  }, 120000);

  it('lets an email step through the permission check once the application role has it', async () => {
    const grant = await syncApplication({
      manifest: buildManifest({ canManageCompanies: true, canSendEmail: true }),
    });

    expect(grant.errors).toBeUndefined();

    const workflowRun = await waitForRunToEnd(
      await runWorkflow(DRAFT_EMAIL_WORKFLOW),
    );
    const [draftStep] = DRAFT_EMAIL_WORKFLOW.steps;
    const draftStepInfo =
      workflowRun.state.stepInfos[draftStep.universalIdentifier];

    // The step still fails on the made-up connected account, after the permission check
    expect(draftStepInfo.status).toBe('FAILED');
    expect(draftStepInfo.error).not.toContain('SEND_EMAIL_TOOL');

    const revocation = await syncApplication({
      manifest: buildManifest({ canManageCompanies: true }),
    });

    expect(revocation.errors).toBeUndefined();
  }, 150000);

  it('checks the current application permissions again when a delayed run resumes', async () => {
    const workflowRunId = await runWorkflow(DELAYED_CREATE_COMPANY_WORKFLOW);
    const [delayStep, createStep] = DELAYED_CREATE_COMPANY_WORKFLOW.steps;

    await waitForRun(
      workflowRunId,
      ({ state }) =>
        state?.stepInfos?.[delayStep.universalIdentifier]?.status === 'PENDING',
    );

    const revocation = await syncApplication({
      manifest: buildManifest({ canManageCompanies: false }),
    });

    expect(revocation.errors).toBeUndefined();

    const workflowRun = await waitForRunToEnd(workflowRunId);

    expect(workflowRun.status).toBe('FAILED');
    expect(
      workflowRun.state.stepInfos[createStep.universalIdentifier].status,
    ).toBe('FAILED');
    expect(await countRecordsByName('company', DELAYED_COMPANY_NAME)).toBe(0);
  }, 150000);

  describe('core workflow reads through an application', () => {
    const APPLICATION_CALLERS = [
      ['a member through the application', buildJaneTokenThroughApplication],
      ['the application alone', buildApplicationTokenWithoutUser],
    ] as const;

    const UNREADABLE_WORKFLOW = {
      coreWorkflowById: null,
      coreWorkflowsWithCurrentVersions: [],
      coreWorkflowVersionsByCoreWorkflowId: [],
      coreWorkflowVersionById: null,
    };

    const UNREADABLE_LEGACY_WORKFLOW = {
      coreWorkflow: null,
      coreWorkflowVersions: [],
      coreWorkflowVersion: null,
    };

    let applicationWorkflowIds: string[];
    let applicationWorkflow: {
      coreWorkflowId: string;
      coreWorkflowVersionId: string;
    };
    let workspaceWorkflow: MemberWorkflow;
    let privateWorkflow: MemberWorkflow;

    const createMemberWorkflow = async (
      name: string,
    ): Promise<MemberWorkflow> => {
      const { coreWorkflowId, coreWorkflowVersionId } =
        await createCoreWorkflow({ name });
      const {
        workspaceWorkflowId,
        workspaceWorkflowVersionIds: [workspaceWorkflowVersionId],
      } = await linkCoreWorkflowToLegacyWorkspaceIds({ coreWorkflowId });

      return {
        coreWorkflowId,
        coreWorkflowVersionId,
        workspaceWorkflowId,
        workspaceWorkflowVersionId,
      };
    };

    const readByLegacyIds = async (token: string, workflow: MemberWorkflow) => {
      const response = await graphqlAs(token, LEGACY_CORE_WORKFLOW_READS, {
        workspaceWorkflowId: workflow.workspaceWorkflowId,
        workspaceWorkflowVersionId: workflow.workspaceWorkflowVersionId,
      });

      expect(response.body.errors).toBeUndefined();

      return response.body.data;
    };

    beforeAll(async () => {
      const applicationWorkflowRows: { id: string }[] =
        await globalThis.testDataSource.query(
          `SELECT id FROM core.workflow WHERE "workspaceId" = $1 AND "applicationId" = $2`,
          [SEED_APPLE_WORKSPACE_ID, await findApplicationId(APP_ID)],
        );

      applicationWorkflowIds = applicationWorkflowRows.map(({ id }) => id);
      applicationWorkflow = await findApplicationWorkflow(
        CREATE_COMPANY_WORKFLOW,
      );

      workspaceWorkflow = await createMemberWorkflow(
        `${RUN_PREFIX} workspace workflow read through applications`,
      );
      privateWorkflow = await createMemberWorkflow(
        `${RUN_PREFIX} private workflow read through applications`,
      );

      const response = await workflowGraphqlRequest(
        UPDATE_CORE_WORKFLOW_VISIBILITY,
        {
          input: {
            coreWorkflowId: privateWorkflow.coreWorkflowId,
            visibility: WorkflowVisibility.PRIVATE,
          },
        },
      );

      expect(response.body.errors).toBeUndefined();
    });

    afterAll(async () => {
      await deleteCoreWorkflows({
        coreWorkflowIds: [
          workspaceWorkflow.coreWorkflowId,
          privateWorkflow.coreWorkflowId,
        ],
      });
    });

    it.each(APPLICATION_CALLERS)(
      'lists no workflow to an application that owns none, called by %s',
      async (_, buildToken) => {
        const { totalCount, coreWorkflowIds } = await listCoreWorkflowIds(
          await buildToken(OTHER_APP_ID),
        );

        expect(totalCount).toBe(0);
        expect(coreWorkflowIds).toEqual([]);
      },
    );

    it.each(APPLICATION_CALLERS)(
      'lists only its own workflows to an application, called by %s',
      async (_, buildToken) => {
        const token = await buildToken(APP_ID);
        const everyWorkflow = await listCoreWorkflowIds(token);
        const workflowsOfThisRun = await listCoreWorkflowIds(
          token,
          RUN_PREFIX_FILTER,
        );

        expect(everyWorkflow.totalCount).toBe(applicationWorkflowIds.length);
        expect(workflowsOfThisRun.totalCount).toBe(
          applicationWorkflowIds.length,
        );
        expect(everyWorkflow.coreWorkflowIds.sort()).toEqual(
          [...applicationWorkflowIds].sort(),
        );
        expect(workflowsOfThisRun.coreWorkflowIds.sort()).toEqual(
          [...applicationWorkflowIds].sort(),
        );
      },
    );

    it.each(APPLICATION_CALLERS)(
      'reads nothing of another application workflow, called by %s',
      async (_, buildToken) => {
        expect(
          await readCoreWorkflow(
            await buildToken(OTHER_APP_ID),
            applicationWorkflow,
          ),
        ).toEqual(UNREADABLE_WORKFLOW);
      },
    );

    it.each(APPLICATION_CALLERS)(
      'reads nothing of a workspace workflow, called by %s',
      async (_, buildToken) => {
        const token = await buildToken(APP_ID);

        expect(
          await readCoreWorkflow(token, {
            coreWorkflowId: workspaceWorkflow.coreWorkflowId,
            coreWorkflowVersionId: workspaceWorkflow.coreWorkflowVersionId,
          }),
        ).toEqual(UNREADABLE_WORKFLOW);
        expect(await readByLegacyIds(token, workspaceWorkflow)).toEqual(
          UNREADABLE_LEGACY_WORKFLOW,
        );
      },
    );

    // An unreachable workflow must read as missing even when it is also private, without naming it in an error.
    it.each([
      [
        'another member through the application',
        buildTimTokenThroughApplication,
      ],
      ['the application alone', buildApplicationTokenWithoutUser],
    ] as const)(
      'reads nothing of a private member workflow, called by %s',
      async (_, buildToken) => {
        const token = await buildToken(APP_ID);

        expect(await readCoreWorkflow(token, privateWorkflow)).toEqual(
          UNREADABLE_WORKFLOW,
        );
        expect(await readByLegacyIds(token, privateWorkflow)).toEqual(
          UNREADABLE_LEGACY_WORKFLOW,
        );

        const computeStepOutputSchema = await graphqlAs(
          token,
          COMPUTE_STEP_OUTPUT_SCHEMA,
          {
            input: {
              step: { type: 'MANUAL', settings: { outputSchema: {} } },
              coreWorkflowVersionId: privateWorkflow.coreWorkflowVersionId,
            },
          },
        );

        expect(computeStepOutputSchema.body.errors).toBeDefined();
        expect(JSON.stringify(computeStepOutputSchema.body)).not.toContain(
          privateWorkflow.coreWorkflowId,
        );
      },
    );

    it.each(APPLICATION_CALLERS)(
      'reads its own workflow, called by %s',
      async (_, buildToken) => {
        const reads = await readCoreWorkflow(
          await buildToken(APP_ID),
          applicationWorkflow,
        );

        expect(reads.coreWorkflowById).toEqual({
          id: applicationWorkflow.coreWorkflowId,
        });
        expect(reads.coreWorkflowsWithCurrentVersions).toEqual([
          { workflow: { id: applicationWorkflow.coreWorkflowId } },
        ]);
        expect(reads.coreWorkflowVersionsByCoreWorkflowId).toContainEqual({
          id: applicationWorkflow.coreWorkflowVersionId,
        });
        expect(reads.coreWorkflowVersionById?.steps).toHaveLength(
          CREATE_COMPANY_WORKFLOW.steps.length,
        );
      },
    );

    it('computes a step output schema only from a version of the calling application', async () => {
      const computeStepOutputSchemaThrough = async (
        applicationUniversalIdentifier: string,
      ) =>
        graphqlAs(
          await buildJaneTokenThroughApplication(
            applicationUniversalIdentifier,
          ),
          COMPUTE_STEP_OUTPUT_SCHEMA,
          {
            input: {
              step: { type: 'MANUAL', settings: { outputSchema: {} } },
              coreWorkflowVersionId: applicationWorkflow.coreWorkflowVersionId,
            },
          },
        );

      const crossApplication =
        await computeStepOutputSchemaThrough(OTHER_APP_ID);

      expect(crossApplication.body.errors?.[0]?.extensions?.code).toBe(
        'FORBIDDEN',
      );
      expect(
        crossApplication.body.data?.computeStepOutputSchema ?? null,
      ).toBeNull();

      const ownApplication = await computeStepOutputSchemaThrough(APP_ID);

      expect(ownApplication.body.errors).toBeUndefined();
    });

    it('keeps listing and reading every workflow for a member session', async () => {
      const { coreWorkflowIds } = await listCoreWorkflowIds(
        APPLE_JANE_ADMIN_ACCESS_TOKEN,
        RUN_PREFIX_FILTER,
      );

      expect(coreWorkflowIds).toEqual(
        expect.arrayContaining([
          ...applicationWorkflowIds,
          workspaceWorkflow.coreWorkflowId,
        ]),
      );

      const applicationWorkflowReads = await readCoreWorkflow(
        APPLE_JANE_ADMIN_ACCESS_TOKEN,
        applicationWorkflow,
      );

      expect(applicationWorkflowReads.coreWorkflowById).toEqual({
        id: applicationWorkflow.coreWorkflowId,
      });
      expect(applicationWorkflowReads.coreWorkflowVersionById?.id).toBe(
        applicationWorkflow.coreWorkflowVersionId,
      );

      const legacyReads = await readByLegacyIds(
        APPLE_JANE_ADMIN_ACCESS_TOKEN,
        workspaceWorkflow,
      );

      expect(legacyReads.coreWorkflow).toEqual({
        id: workspaceWorkflow.coreWorkflowId,
      });
      expect(legacyReads.coreWorkflowVersion?.id).toBe(
        workspaceWorkflow.coreWorkflowVersionId,
      );
    });
  });
});

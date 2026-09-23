import { randomUUID } from 'node:crypto';

import request from 'supertest';
import { submitFormStep } from 'test/integration/graphql/suites/workflow/utils/submit-form-step.util';
import { runWorkflowActionStep } from 'test/integration/graphql/suites/workflow/utils/run-workflow-action-step.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import {
  getWorkflowVersionUniversalIdentifier,
  type Manifest,
} from 'twenty-shared/application';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FeatureFlagKey } from 'twenty-shared/types';

import { type LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

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

const TEST_WORKFLOWS = [
  CREATE_COMPANY_WORKFLOW,
  CREATE_OPPORTUNITY_WORKFLOW,
  LOGIC_FUNCTION_WORKFLOW,
  DELAYED_CREATE_COMPANY_WORKFLOW,
  FORM_WORKFLOW,
];

const buildManifest = ({
  canManageCompanies,
}: {
  canManageCompanies: boolean;
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
          permissionFlagUniversalIdentifiers: [SystemPermissionFlag.WORKFLOWS],
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
      workflows: TEST_WORKFLOWS.map((workflow, index) => {
        jestExpectToBeDefined(workflow.steps[0]);

        return {
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
        };
      }),
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

const graphqlAs = (token: string, query: string, variables?: object) =>
  request(`http://localhost:${APP_PORT}`)
    .post('/graphql')
    .set('Authorization', `Bearer ${token}`)
    .send({ query, variables });

const buildJaneTokenThroughApplication = async (
  applicationUniversalIdentifier: string,
): Promise<string> => {
  const [{ id: applicationId }] = await globalThis.testDataSource.query(
    `SELECT id FROM core.application WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
    [applicationUniversalIdentifier, SEED_APPLE_WORKSPACE_ID],
  );
  const { applicationAccessToken } = await generateApplicationTokenPair({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    applicationId,
    userId: USER_DATA_SEED_IDS.JANE,
    userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
  });

  return applicationAccessToken.token;
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
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_APPLICATION_WORKFLOWS_ENABLED,
      value: true,
      expectToFail: false,
    });

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
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_APPLICATION_WORKFLOWS_ENABLED,
      value: false,
      expectToFail: false,
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
    const createStep = CREATE_OPPORTUNITY_WORKFLOW.steps[0];
    jestExpectToBeDefined(createStep);

    expect(workflowRun.status).toBe('FAILED');
    expect(
      workflowRun.state.stepInfos[createStep.universalIdentifier]?.status,
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

  it('keeps the application bound when its token starts a workspace workflow', async () => {
    const { status, stepStatus } = await runWorkflowActionStep({
      name: `${RUN_PREFIX} workspace workflow started by the application`,
      stepType: 'CREATE_RECORD',
      input: {
        objectName: 'opportunity',
        objectRecord: { name: NESTED_OPPORTUNITY_NAME },
      },
      runToken: await buildJaneTokenThroughApplication(APP_ID),
    });

    expect(status).toBe('FAILED');
    expect(stepStatus).toBe('FAILED');
    expect(
      await countRecordsByName('opportunity', NESTED_OPPORTUNITY_NAME),
    ).toBe(0);
  }, 120000);

  it('refuses email steps when an application token starts a workspace workflow', async () => {
    const { status, stepStatus, stepError } = await runWorkflowActionStep({
      name: `${RUN_PREFIX} workspace email workflow started by the application`,
      stepType: 'SEND_EMAIL',
      input: {
        recipients: { to: 'recipient@example.com' },
        subject: 'Application workflow permissions',
        body: 'Should never be sent',
      },
      runToken: await buildJaneTokenThroughApplication(APP_ID),
    });

    expect(status).toBe('FAILED');
    expect(stepStatus).toBe('FAILED');
    expect(stepError).toContain('Applications cannot use SEND_EMAIL steps');
  }, 120000);

  it('only lets the values of a form step change on an application workflow run', async () => {
    const workflowRunId = await runWorkflow(FORM_WORKFLOW);
    const formStep = FORM_WORKFLOW.steps[0];
    jestExpectToBeDefined(formStep);

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
  }, 120000);

  it('reads the records picked in a form with the permissions of the run, keeping a refused form open', async () => {
    const [formStep] = FORM_WORKFLOW.steps;

    jestExpectToBeDefined(formStep);

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
        ?.status,
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
      workflowRun.state.stepInfos[formStep.universalIdentifier]?.result,
    ).toMatchObject({ company: { id: company.id } });
    expect(
      workflowRun.state.stepInfos[formStep.universalIdentifier]?.result,
    ).not.toHaveProperty('opportunity');
  }, 120000);

  it('checks the current application permissions again when a delayed run resumes', async () => {
    const workflowRunId = await runWorkflow(DELAYED_CREATE_COMPANY_WORKFLOW);
    const delayStep = DELAYED_CREATE_COMPANY_WORKFLOW.steps[0];
    jestExpectToBeDefined(delayStep);

    const createStep = DELAYED_CREATE_COMPANY_WORKFLOW.steps[1];
    jestExpectToBeDefined(createStep);

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
      workflowRun.state.stepInfos[createStep.universalIdentifier]?.status,
    ).toBe('FAILED');
    expect(await countRecordsByName('company', DELAYED_COMPANY_NAME)).toBe(0);
  }, 150000);
});

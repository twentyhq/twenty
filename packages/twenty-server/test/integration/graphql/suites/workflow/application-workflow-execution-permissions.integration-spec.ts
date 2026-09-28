import { randomUUID } from 'node:crypto';

import request from 'supertest';
import { runWorkflowActionStep } from 'test/integration/graphql/suites/workflow/utils/run-workflow-action-step.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { type Manifest } from 'twenty-shared/application';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FeatureFlagKey } from 'twenty-shared/types';

import { type LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { CONNECTED_ACCOUNT_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/connected-account-data-seeds.constant';

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
  versionUniversalIdentifier: string;
  steps: WorkflowStepManifest[];
};

const buildTestWorkflow = (
  steps: WorkflowStepManifestWithoutEdges[],
): TestWorkflow => {
  const stepIds = steps.map(() => randomUUID());

  return {
    universalIdentifier: randomUUID(),
    versionUniversalIdentifier: randomUUID(),
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

const SEND_EMAIL_WORKFLOW = buildTestWorkflow([
  {
    name: 'Send from another member mailbox',
    type: 'SEND_EMAIL',
    input: {
      connectedAccountId: CONNECTED_ACCOUNT_DATA_SEED_IDS.TIM,
      recipients: { to: 'recipient@example.com' },
      subject: 'Application workflow permissions',
      body: 'Should never be sent',
    },
  } as WorkflowStepManifestWithoutEdges,
]);

const CREATE_CALENDAR_EVENT_WORKFLOW = buildTestWorkflow([
  {
    name: 'Create calendar event',
    type: 'CREATE_CALENDAR_EVENT',
    input: {
      connectedAccountId: CONNECTED_ACCOUNT_DATA_SEED_IDS.JANE,
      title: 'Application workflow permissions',
      startsAt: '2030-01-15T10:00:00Z',
      endsAt: '2030-01-15T10:15:00Z',
      isFullDay: false,
      sendInvitations: false,
      addConferencing: false,
      timeZone: 'UTC',
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

const TEST_WORKFLOWS = [
  CREATE_COMPANY_WORKFLOW,
  CREATE_OPPORTUNITY_WORKFLOW,
  SEND_EMAIL_WORKFLOW,
  CREATE_CALENDAR_EVENT_WORKFLOW,
  LOGIC_FUNCTION_WORKFLOW,
  DELAYED_CREATE_COMPANY_WORKFLOW,
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
          permissionFlagUniversalIdentifiers: [
            SystemPermissionFlag.WORKFLOWS,
            SystemPermissionFlag.SEND_EMAIL_TOOL,
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
          universalIdentifier: workflow.versionUniversalIdentifier,
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

const RETRY_WORKFLOW_RUN = `
  mutation RetryWorkflowRun($workflowRunId: UUID!) {
    retryWorkflowRun(workflowRunId: $workflowRunId) {
      id
    }
  }
`;

const graphqlAs = (token: string, query: string, variables?: object) =>
  request(`http://localhost:${APP_PORT}`)
    .post('/graphql')
    .set('Authorization', `Bearer ${token}`)
    .send({ query, variables });

const findVersionId = async (workflow: TestWorkflow): Promise<string> => {
  const [version] = await globalThis.testDataSource.query(
    `SELECT id FROM core."workflowVersion"
     WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
    [SEED_APPLE_WORKSPACE_ID, workflow.versionUniversalIdentifier],
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
    stepInfos: Record<string, { status: string; error?: string }>;
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
  for (let attempt = 0; attempt < 900; attempt++) {
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
    jest.useRealTimers();

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

    const installation = await syncApplication({
      manifest: buildManifest({ canManageCompanies: true }),
    });

    expect(installation.errors).toBeUndefined();

    await setupApplicationForSync({
      applicationUniversalIdentifier: OTHER_APP_ID,
      name: 'Other application',
      description: 'Application that tries to start another one workflows',
      sourcePath: 'application-workflow-permissions-other',
    });

    const otherInstallation = await syncApplication({
      manifest: OTHER_APPLICATION_MANIFEST,
    });

    expect(otherInstallation.errors).toBeUndefined();

    await waitForAllJobsToFinish();
  }, 300000);

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
    jest.useFakeTimers();
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

  it('requires the tool permission of calendar steps on the application role', async () => {
    const workflowRun = await waitForRunToEnd(
      await runWorkflow(CREATE_CALENDAR_EVENT_WORKFLOW),
    );
    const [calendarStep] = CREATE_CALENDAR_EVENT_WORKFLOW.steps;

    expect(workflowRun.status).toBe('FAILED');
    expect(
      workflowRun.state.stepInfos[calendarStep.universalIdentifier].error,
    ).toContain('CREATE_CALENDAR_EVENT_TOOL');
  }, 120000);

  it('refuses the private connected account of another member', async () => {
    const workflowRun = await waitForRunToEnd(
      await runWorkflow(SEND_EMAIL_WORKFLOW),
    );
    const [emailStep] = SEND_EMAIL_WORKFLOW.steps;

    expect(workflowRun.status).toBe('FAILED');
    expect(
      workflowRun.state.stepInfos[emailStep.universalIdentifier].error,
    ).toContain('is private to another member');
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
    const [{ id: otherApplicationId }] = await globalThis.testDataSource.query(
      `SELECT id FROM core.application WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
      [OTHER_APP_ID, SEED_APPLE_WORKSPACE_ID],
    );
    const [{ id: applicationId }] = await globalThis.testDataSource.query(
      `SELECT id FROM core.application WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
      [APP_ID, SEED_APPLE_WORKSPACE_ID],
    );
    const tokenFor = async (tokenApplicationId: string) =>
      (
        await generateApplicationTokenPair({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          applicationId: tokenApplicationId,
          userId: USER_DATA_SEED_IDS.JANE,
          userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
        })
      ).applicationAccessToken.token;

    const crossApplicationStart = await graphqlAs(
      await tokenFor(otherApplicationId),
      RUN_CORE_WORKFLOW_VERSION,
      { input: { coreWorkflowVersionId } },
    );

    expect(crossApplicationStart.body.errors?.[0]?.message).toContain(
      'cannot start a workflow owned by another application',
    );

    const ownApplicationStart = await graphqlAs(
      await tokenFor(applicationId),
      RUN_CORE_WORKFLOW_VERSION,
      { input: { coreWorkflowVersionId } },
    );

    expect(ownApplicationStart.body.errors).toBeUndefined();
    await waitForRunToEnd(
      ownApplicationStart.body.data.runCoreWorkflowVersion.workflowRunId,
    );
  }, 120000);

  it('keeps the application bound when its token starts a workspace workflow', async () => {
    const [{ id: applicationId }] = await globalThis.testDataSource.query(
      `SELECT id FROM core.application WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
      [APP_ID, SEED_APPLE_WORKSPACE_ID],
    );
    const { applicationAccessToken } = await generateApplicationTokenPair({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId,
      userId: USER_DATA_SEED_IDS.JANE,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
    });

    const { status, stepStatus } = await runWorkflowActionStep({
      name: `${RUN_PREFIX} workspace workflow started by the application`,
      stepType: 'CREATE_RECORD',
      input: {
        objectName: 'opportunity',
        objectRecord: { name: NESTED_OPPORTUNITY_NAME },
      },
      runToken: applicationAccessToken.token,
    });

    expect(status).toBe('FAILED');
    expect(stepStatus).toBe('FAILED');
    expect(
      await countRecordsByName('opportunity', NESTED_OPPORTUNITY_NAME),
    ).toBe(0);
  }, 120000);

  it('only lets the member who started an application workflow run retry it', async () => {
    const workflowRunId = await runWorkflow(CREATE_OPPORTUNITY_WORKFLOW);

    expect((await waitForRunToEnd(workflowRunId)).status).toBe('FAILED');

    const retryWithApiKey = await graphqlAs(
      API_KEY_ACCESS_TOKEN,
      RETRY_WORKFLOW_RUN,
      { workflowRunId },
    );

    expect(retryWithApiKey.body.errors?.[0]?.message).toContain(
      'Only the member who started this application-bound workflow run',
    );

    const retryByInitiator = await workflowGraphqlRequest(RETRY_WORKFLOW_RUN, {
      workflowRunId,
    });

    expect(retryByInitiator.body.errors).toBeUndefined();
    expect((await waitForRunToEnd(workflowRunId)).status).toBe('FAILED');
    expect(await countRecordsByName('opportunity', OPPORTUNITY_NAME)).toBe(0);
  }, 120000);

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
});

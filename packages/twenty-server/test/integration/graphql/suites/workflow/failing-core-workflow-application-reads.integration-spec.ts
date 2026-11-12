import { randomUUID } from 'node:crypto';

import {
  buildTestApplicationWorkflow,
  createCompanyStep,
  findTestCoreWorkflowId,
  findTestWorkflowVersionId,
} from 'test/integration/graphql/suites/workflow/utils/application-workflow-test.util';
import { computeStepOutputSchema } from 'test/integration/graphql/suites/workflow/utils/compute-step-output-schema.util';
import { deleteCoreWorkflows } from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import {
  createMemberCoreWorkflow,
  type MemberCoreWorkflow,
} from 'test/integration/graphql/suites/workflow/utils/create-member-core-workflow.util';
import { findCoreWorkflowById } from 'test/integration/graphql/suites/workflow/utils/find-core-workflow-by-id.util';
import { findCoreWorkflowByWorkspaceWorkflowId } from 'test/integration/graphql/suites/workflow/utils/find-core-workflow-by-workspace-workflow-id.util';
import { findCoreWorkflowVersionById } from 'test/integration/graphql/suites/workflow/utils/find-core-workflow-version-by-id.util';
import { findCoreWorkflowVersionByWorkspaceWorkflowVersionId } from 'test/integration/graphql/suites/workflow/utils/find-core-workflow-version-by-workspace-workflow-version-id.util';
import { findCoreWorkflowVersionsByCoreWorkflowId } from 'test/integration/graphql/suites/workflow/utils/find-core-workflow-versions-by-core-workflow-id.util';
import { findCoreWorkflowVersionsByWorkspaceWorkflowId } from 'test/integration/graphql/suites/workflow/utils/find-core-workflow-versions-by-workspace-workflow-id.util';
import { findCoreWorkflows } from 'test/integration/graphql/suites/workflow/utils/find-core-workflows.util';
import { findCoreWorkflowsWithCurrentVersions } from 'test/integration/graphql/suites/workflow/utils/find-core-workflows-with-current-versions.util';
import { installWorkflowTestApplication } from 'test/integration/graphql/suites/workflow/utils/install-workflow-test-application.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { WorkflowVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const RUN_PREFIX = `Failing core workflow application reads ${randomUUID()}`;
const APPLICATION_UNIVERSAL_IDENTIFIER = randomUUID();
const OTHER_APPLICATION_UNIVERSAL_IDENTIFIER = randomUUID();

const APPLICATION_WORKFLOW = buildTestApplicationWorkflow(
  `${RUN_PREFIX} application workflow`,
  [createCompanyStep(`${RUN_PREFIX} company`)],
);

const MANUAL_STEP = { type: 'MANUAL', settings: { outputSchema: {} } };

const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;

const maskIds = (message: string) => message.replace(UUID_PATTERN, '<id>');

type TargetWorkflow = {
  coreWorkflowId: string;
  coreWorkflowVersionId: string;
};

type GlobalTestContext = {
  applicationId: string;
  otherApplicationId: string;
  applicationWorkflow: TargetWorkflow;
  workspaceWorkflow: MemberCoreWorkflow;
  privateWorkflow: MemberCoreWorkflow;
};

type CallerTestContext = {
  buildToken: (applicationId: string) => Promise<string>;
};

type TargetTestContext = {
  callingApplicationId: (globalContext: GlobalTestContext) => string;
  workflow: (globalContext: GlobalTestContext) => TargetWorkflow;
};

type MemberWorkflowTestContext = {
  workflow: (globalContext: GlobalTestContext) => MemberCoreWorkflow;
};

const callerTestCases: EachTestingContext<CallerTestContext>[] = [
  {
    title: 'called by a member through the application',
    context: {
      buildToken: async (applicationId) =>
        (await generateAppleAdminApplicationTokenPair({ applicationId }))
          .applicationAccessToken.token,
    },
  },
  {
    title: 'called by another member through the application',
    context: {
      buildToken: async (applicationId) =>
        (
          await generateApplicationTokenPair({
            workspaceId: SEED_APPLE_WORKSPACE_ID,
            applicationId,
            userId: USER_DATA_SEED_IDS.TIM,
            userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
          })
        ).applicationAccessToken.token,
    },
  },
  {
    title: 'called by the application alone',
    context: {
      buildToken: async (applicationId) =>
        (
          await generateApplicationTokenPair({
            workspaceId: SEED_APPLE_WORKSPACE_ID,
            applicationId,
          })
        ).applicationAccessToken.token,
    },
  },
];

const targetTestCases: EachTestingContext<TargetTestContext>[] = [
  {
    title: 'another application workflow',
    context: {
      callingApplicationId: (globalContext) => globalContext.otherApplicationId,
      workflow: (globalContext) => globalContext.applicationWorkflow,
    },
  },
  {
    title: 'a workspace workflow',
    context: {
      callingApplicationId: (globalContext) => globalContext.applicationId,
      workflow: (globalContext) => globalContext.workspaceWorkflow,
    },
  },
  {
    title: 'a private member workflow',
    context: {
      callingApplicationId: (globalContext) => globalContext.applicationId,
      workflow: (globalContext) => globalContext.privateWorkflow,
    },
  },
];

const memberWorkflowTestCases: EachTestingContext<MemberWorkflowTestContext>[] =
  [
    {
      title: 'a workspace workflow',
      context: { workflow: (globalContext) => globalContext.workspaceWorkflow },
    },
    {
      title: 'a private member workflow',
      context: { workflow: (globalContext) => globalContext.privateWorkflow },
    },
  ];

describe('Core workflow reads through an application should fail', () => {
  let globalTestContext: GlobalTestContext;

  beforeAll(async () => {
    const applicationId = await installWorkflowTestApplication({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      name: 'Core workflow reads owner',
      workflows: [APPLICATION_WORKFLOW],
    });
    const otherApplicationId = await installWorkflowTestApplication({
      applicationUniversalIdentifier: OTHER_APPLICATION_UNIVERSAL_IDENTIFIER,
      name: 'Core workflow reads other',
      workflows: [],
    });

    const applicationCoreWorkflowId =
      await findTestCoreWorkflowId(APPLICATION_WORKFLOW);
    const applicationCoreWorkflowVersionId = await findTestWorkflowVersionId({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      workflow: APPLICATION_WORKFLOW,
    });

    if (
      !isDefined(applicationCoreWorkflowId) ||
      !isDefined(applicationCoreWorkflowVersionId)
    ) {
      throw new Error('The application workflow was not installed');
    }

    globalTestContext = {
      applicationId,
      otherApplicationId,
      applicationWorkflow: {
        coreWorkflowId: applicationCoreWorkflowId,
        coreWorkflowVersionId: applicationCoreWorkflowVersionId,
      },
      workspaceWorkflow: await createMemberCoreWorkflow({
        name: `${RUN_PREFIX} workspace workflow`,
        visibility: WorkflowVisibility.WORKSPACE,
      }),
      privateWorkflow: await createMemberCoreWorkflow({
        name: `${RUN_PREFIX} private workflow`,
        visibility: WorkflowVisibility.PRIVATE,
      }),
    };
  }, 120000);

  afterAll(async () => {
    if (!isDefined(globalTestContext)) {
      return;
    }

    await deleteCoreWorkflows({
      coreWorkflowIds: [
        globalTestContext.workspaceWorkflow.coreWorkflowId,
        globalTestContext.privateWorkflow.coreWorkflowId,
      ],
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: OTHER_APPLICATION_UNIVERSAL_IDENTIFIER,
    });
  });

  describe.each(eachTestingContextFilter(callerTestCases))(
    '$title',
    ({ context: callerContext }) => {
      it('should list no workflow to an application that owns none', async () => {
        const { data } = await findCoreWorkflows({
          input: {},
          token: await callerContext.buildToken(
            globalTestContext.otherApplicationId,
          ),
          expectToFail: false,
        });

        expect(data.coreWorkflows).toEqual({ edges: [], totalCount: 0 });
      });

      describe.each(eachTestingContextFilter(targetTestCases))(
        'reading $title',
        ({ context: targetContext }) => {
          const buildCallerToken = () =>
            callerContext.buildToken(
              targetContext.callingApplicationId(globalTestContext),
            );

          it('should not find the workflow by id', async () => {
            const { data } = await findCoreWorkflowById({
              input: {
                coreWorkflowId:
                  targetContext.workflow(globalTestContext).coreWorkflowId,
              },
              token: await buildCallerToken(),
              expectToFail: false,
            });

            expect(data.coreWorkflowById).toBeNull();
          });

          it('should not return the workflow with its current version', async () => {
            const { data } = await findCoreWorkflowsWithCurrentVersions({
              input: {
                coreWorkflowIds: [
                  targetContext.workflow(globalTestContext).coreWorkflowId,
                ],
              },
              token: await buildCallerToken(),
              expectToFail: false,
            });

            expect(data.coreWorkflowsWithCurrentVersions).toEqual([]);
          });

          it('should list none of the workflow versions', async () => {
            const { data } = await findCoreWorkflowVersionsByCoreWorkflowId({
              input: {
                coreWorkflowId:
                  targetContext.workflow(globalTestContext).coreWorkflowId,
              },
              token: await buildCallerToken(),
              expectToFail: false,
            });

            expect(data.coreWorkflowVersionsByCoreWorkflowId).toEqual([]);
          });

          it('should not find the workflow version by id', async () => {
            const { data } = await findCoreWorkflowVersionById({
              input: {
                coreWorkflowVersionId:
                  targetContext.workflow(globalTestContext)
                    .coreWorkflowVersionId,
              },
              token: await buildCallerToken(),
              expectToFail: false,
            });

            expect(data.coreWorkflowVersionById).toBeNull();
          });

          it('should refuse to compute a step output schema from the workflow version', async () => {
            const { errors } = await computeStepOutputSchema({
              input: {
                step: MANUAL_STEP,
                coreWorkflowVersionId:
                  targetContext.workflow(globalTestContext)
                    .coreWorkflowVersionId,
              },
              token: await buildCallerToken(),
              expectToFail: true,
            });

            expectOneNotInternalServerErrorSnapshot({
              errors,
              normalizeMessage: maskIds,
            });
          });
        },
      );

      describe.each(eachTestingContextFilter(memberWorkflowTestCases))(
        'reading $title by its workspace ids',
        ({ context: memberWorkflowContext }) => {
          const buildCallerToken = () =>
            callerContext.buildToken(globalTestContext.applicationId);

          it('should not find the workflow', async () => {
            const { data } = await findCoreWorkflowByWorkspaceWorkflowId({
              input: {
                workspaceWorkflowId:
                  memberWorkflowContext.workflow(globalTestContext)
                    .workspaceWorkflowId,
              },
              token: await buildCallerToken(),
              expectToFail: false,
            });

            expect(data.coreWorkflow).toBeNull();
          });

          it('should list none of the workflow versions', async () => {
            const { data } =
              await findCoreWorkflowVersionsByWorkspaceWorkflowId({
                input: {
                  workspaceWorkflowId:
                    memberWorkflowContext.workflow(globalTestContext)
                      .workspaceWorkflowId,
                },
                token: await buildCallerToken(),
                expectToFail: false,
              });

            expect(data.coreWorkflowVersions).toEqual([]);
          });

          it('should not find the workflow version', async () => {
            const { data } =
              await findCoreWorkflowVersionByWorkspaceWorkflowVersionId({
                input: {
                  workspaceWorkflowVersionId:
                    memberWorkflowContext.workflow(globalTestContext)
                      .workspaceWorkflowVersionId,
                },
                token: await buildCallerToken(),
                expectToFail: false,
              });

            expect(data.coreWorkflowVersion).toBeNull();
          });
        },
      );
    },
  );
});

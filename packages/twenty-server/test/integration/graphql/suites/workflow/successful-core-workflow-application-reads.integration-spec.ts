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
import { findCoreWorkflowVersionsByCoreWorkflowId } from 'test/integration/graphql/suites/workflow/utils/find-core-workflow-versions-by-core-workflow-id.util';
import { findCoreWorkflows } from 'test/integration/graphql/suites/workflow/utils/find-core-workflows.util';
import { findCoreWorkflowsWithCurrentVersions } from 'test/integration/graphql/suites/workflow/utils/find-core-workflows-with-current-versions.util';
import { installWorkflowTestApplication } from 'test/integration/graphql/suites/workflow/utils/install-workflow-test-application.util';
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

const RUN_PREFIX = `Successful core workflow application reads ${randomUUID()}`;
const APPLICATION_UNIVERSAL_IDENTIFIER = randomUUID();

const APPLICATION_WORKFLOW = buildTestApplicationWorkflow(
  `${RUN_PREFIX} application workflow`,
  [createCompanyStep(`${RUN_PREFIX} company`)],
);

const RUN_PREFIX_FILTER = {
  logicalOperator: 'AND',
  rules: [{ fieldKey: 'NAME', operand: 'CONTAINS', value: RUN_PREFIX }],
};

type GlobalTestContext = {
  applicationId: string;
  applicationWorkflow: {
    coreWorkflowId: string;
    coreWorkflowVersionId: string;
  };
  workspaceWorkflow: MemberCoreWorkflow;
};

type CallerTestContext = {
  buildToken: (applicationId: string) => Promise<string>;
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

describe('Core workflow reads through an application should succeed', () => {
  let globalTestContext: GlobalTestContext;

  beforeAll(async () => {
    const applicationId = await installWorkflowTestApplication({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      name: 'Core workflow reads owner',
      workflows: [APPLICATION_WORKFLOW],
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
      applicationWorkflow: {
        coreWorkflowId: applicationCoreWorkflowId,
        coreWorkflowVersionId: applicationCoreWorkflowVersionId,
      },
      workspaceWorkflow: await createMemberCoreWorkflow({
        name: `${RUN_PREFIX} workspace workflow`,
        visibility: WorkflowVisibility.WORKSPACE,
      }),
    };
  }, 120000);

  afterAll(async () => {
    if (!isDefined(globalTestContext)) {
      return;
    }

    await deleteCoreWorkflows({
      coreWorkflowIds: [globalTestContext.workspaceWorkflow.coreWorkflowId],
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    });
  });

  describe.each(eachTestingContextFilter(callerTestCases))(
    '$title',
    ({ context: callerContext }) => {
      const buildCallerToken = () =>
        callerContext.buildToken(globalTestContext.applicationId);

      it.each([
        { title: 'without a filter', filter: undefined },
        { title: 'with a name filter', filter: RUN_PREFIX_FILTER },
      ])(
        'should list exactly the application workflows $title',
        async ({ filter }) => {
          const { data } = await findCoreWorkflows({
            input: { filter },
            token: await buildCallerToken(),
            expectToFail: false,
          });

          expect(data.coreWorkflows).toEqual({
            edges: [
              {
                node: {
                  id: globalTestContext.applicationWorkflow.coreWorkflowId,
                },
              },
            ],
            totalCount: 1,
          });
        },
      );

      it('should find its workflow by id', async () => {
        const { data } = await findCoreWorkflowById({
          input: {
            coreWorkflowId:
              globalTestContext.applicationWorkflow.coreWorkflowId,
          },
          token: await buildCallerToken(),
          expectToFail: false,
        });

        expect(data.coreWorkflowById).toEqual({
          id: globalTestContext.applicationWorkflow.coreWorkflowId,
        });
      });

      it('should return its workflow with its current version', async () => {
        const { data } = await findCoreWorkflowsWithCurrentVersions({
          input: {
            coreWorkflowIds: [
              globalTestContext.applicationWorkflow.coreWorkflowId,
            ],
          },
          token: await buildCallerToken(),
          expectToFail: false,
        });

        expect(data.coreWorkflowsWithCurrentVersions).toEqual([
          {
            workflow: {
              id: globalTestContext.applicationWorkflow.coreWorkflowId,
            },
          },
        ]);
      });

      it('should list its workflow versions', async () => {
        const { data } = await findCoreWorkflowVersionsByCoreWorkflowId({
          input: {
            coreWorkflowId:
              globalTestContext.applicationWorkflow.coreWorkflowId,
          },
          token: await buildCallerToken(),
          expectToFail: false,
        });

        expect(data.coreWorkflowVersionsByCoreWorkflowId).toContainEqual({
          id: globalTestContext.applicationWorkflow.coreWorkflowVersionId,
        });
      });

      it('should find its workflow version by id with its steps', async () => {
        const { data } = await findCoreWorkflowVersionById({
          input: {
            coreWorkflowVersionId:
              globalTestContext.applicationWorkflow.coreWorkflowVersionId,
          },
          token: await buildCallerToken(),
          expectToFail: false,
        });

        expect(data.coreWorkflowVersionById?.steps).toHaveLength(
          APPLICATION_WORKFLOW.steps.length,
        );
      });
    },
  );

  it('should compute a step output schema from its workflow version for a member through the application', async () => {
    const { errors } = await computeStepOutputSchema({
      input: {
        step: { type: 'MANUAL', settings: { outputSchema: {} } },
        coreWorkflowVersionId:
          globalTestContext.applicationWorkflow.coreWorkflowVersionId,
      },
      token: (
        await generateAppleAdminApplicationTokenPair({
          applicationId: globalTestContext.applicationId,
        })
      ).applicationAccessToken.token,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
  });

  it('should still list and read every workflow for a member session', async () => {
    const { data: listData } = await findCoreWorkflows({
      input: { filter: RUN_PREFIX_FILTER },
      expectToFail: false,
    });

    expect(
      listData.coreWorkflows.edges.map(({ node }) => node.id).sort(),
    ).toEqual(
      [
        globalTestContext.applicationWorkflow.coreWorkflowId,
        globalTestContext.workspaceWorkflow.coreWorkflowId,
      ].sort(),
    );

    const { data: versionData } = await findCoreWorkflowVersionById({
      input: {
        coreWorkflowVersionId:
          globalTestContext.applicationWorkflow.coreWorkflowVersionId,
      },
      expectToFail: false,
    });

    expect(versionData.coreWorkflowVersionById?.id).toBe(
      globalTestContext.applicationWorkflow.coreWorkflowVersionId,
    );

    const { data: legacyData } = await findCoreWorkflowByWorkspaceWorkflowId({
      input: {
        workspaceWorkflowId:
          globalTestContext.workspaceWorkflow.workspaceWorkflowId,
      },
      expectToFail: false,
    });

    expect(legacyData.coreWorkflow).toEqual({
      id: globalTestContext.workspaceWorkflow.coreWorkflowId,
    });
  });
});

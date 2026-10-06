import request from 'supertest';
import {
  ACTIVATE_CORE_WORKFLOW_VERSION_MUTATION,
  activateCoreWorkflowVersion,
  CORE_WORKFLOW_MANUAL_TRIGGER,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  runCoreWorkflowVersion,
  updateCoreWorkflowVersionStepInput,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow-test.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
import {
  destroyWorkflowRun,
  waitForWorkflowCompletion,
} from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';
import { isDefined } from 'twenty-shared/utils';

const client = request(`http://localhost:${APP_PORT}`);

const graphql = async (query: string, variables?: Record<string, unknown>) => {
  const response = await client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({ query, variables });

  expect(response.body.errors).toBeUndefined();

  return response.body.data;
};

describe('Pick Record Workflow - load balanced (e2e)', () => {
  let coreWorkflowId: string | null = null;
  let coreWorkflowVersionId: string | null = null;
  let pickRecordStepId: string | null = null;
  let leastLoadedCompanyId: string | null = null;
  let mostLoadedCompanyId: string | null = null;
  let createdOpportunityId: string | null = null;

  beforeAll(async () => {
    const createdCoreWorkflow = await createCoreWorkflow({
      name: 'Pick Record Load Balanced Test',
    });

    coreWorkflowId = createdCoreWorkflow.coreWorkflowId;
    coreWorkflowVersionId = createdCoreWorkflow.coreWorkflowVersionId;

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId,
      trigger: CORE_WORKFLOW_MANUAL_TRIGGER,
    });

    const pickRecordStep = await createCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      stepType: 'PICK_RECORD',
    });

    pickRecordStepId = pickRecordStep.id;

    // Two fresh companies start with zero related opportunities; adding one
    // opportunity to the second makes the first the least loaded candidate.
    const companyOneData = await graphql(`
      mutation {
        createCompany(data: { name: "Pick Record LB company one" }) {
          id
        }
      }
    `);

    const companyTwoData = await graphql(`
      mutation {
        createCompany(data: { name: "Pick Record LB company two" }) {
          id
        }
      }
    `);

    // The executor orders candidates by id before selecting. Attach the
    // opportunity to the id-first company so the least-loaded candidate is the
    // id-second one: load balancing must pick it, which also guards against a
    // regression where a broken count would fall back to the first candidate.
    const [firstSortedCompanyId, secondSortedCompanyId] = [
      companyOneData.createCompany.id,
      companyTwoData.createCompany.id,
    ].sort((idA: string, idB: string) => idA.localeCompare(idB));

    mostLoadedCompanyId = firstSortedCompanyId;
    leastLoadedCompanyId = secondSortedCompanyId;

    const opportunityData = await graphql(
      `
        mutation CreateOpportunity($companyId: UUID!) {
          createOpportunity(
            data: { name: "Pick Record LB Opportunity", companyId: $companyId }
          ) {
            id
          }
        }
      `,
      { companyId: mostLoadedCompanyId },
    );

    createdOpportunityId = opportunityData.createOpportunity.id;

    await updateCoreWorkflowVersionStepInput({
      coreWorkflowVersionId,
      step: pickRecordStep,
      input: {
        objectName: 'company',
        strategy: 'LOAD_BALANCED',
        recordIds: [leastLoadedCompanyId, mostLoadedCompanyId],
        loadBalance: {
          objectNameSingular: 'opportunity',
          fieldName: 'company',
        },
      },
    });

    await activateCoreWorkflowVersion(coreWorkflowVersionId);
  });

  afterAll(async () => {
    if (createdOpportunityId) {
      await graphql(
        `
          mutation DeleteOpportunity($id: UUID!) {
            deleteOpportunity(id: $id) {
              id
            }
          }
        `,
        { id: createdOpportunityId },
      );
    }

    for (const companyId of [leastLoadedCompanyId, mostLoadedCompanyId]) {
      if (companyId) {
        await graphql(
          `
            mutation DeleteCompany($id: UUID!) {
              deleteCompany(id: $id) {
                id
              }
            }
          `,
          { id: companyId },
        );
      }
    }

    if (isDefined(coreWorkflowId)) {
      await deleteCoreWorkflows([coreWorkflowId]);
    }
  });

  it('picks the candidate with the fewest related records', async () => {
    const workflowRunId = await runCoreWorkflowVersion({
      coreWorkflowVersionId: coreWorkflowVersionId!,
      payload: {},
    });

    const workflowRun = await waitForWorkflowCompletion(workflowRunId);

    expect(workflowRun?.status).toBe('COMPLETED');

    const result = workflowRun?.state?.stepInfos?.[pickRecordStepId!]
      ?.result as { id: string } | undefined;

    await destroyWorkflowRun(workflowRunId);

    expect(result?.id).toBe(leastLoadedCompanyId);
  });

  it('rejects activation when the count-by relation points to another object', async () => {
    const misroutedCoreWorkflow = await createCoreWorkflow({
      name: 'Pick Record LB misrouted relation',
    });

    try {
      await updateCoreWorkflowVersionTrigger({
        coreWorkflowVersionId: misroutedCoreWorkflow.coreWorkflowVersionId,
        trigger: CORE_WORKFLOW_MANUAL_TRIGGER,
      });

      const pickRecordStep = await createCoreWorkflowVersionStep({
        coreWorkflowVersionId: misroutedCoreWorkflow.coreWorkflowVersionId,
        stepType: 'PICK_RECORD',
      });

      // pointOfContact is a many-to-one relation on opportunity, but it points
      // to person, not the company pool — the silent misrouting the guard blocks.
      await updateCoreWorkflowVersionStepInput({
        coreWorkflowVersionId: misroutedCoreWorkflow.coreWorkflowVersionId,
        step: pickRecordStep,
        input: {
          objectName: 'company',
          strategy: 'LOAD_BALANCED',
          recordIds: [],
          loadBalance: {
            objectNameSingular: 'opportunity',
            fieldName: 'pointOfContact',
          },
        },
      });

      const activateResponse = await workflowGraphqlRequest(
        ACTIVATE_CORE_WORKFLOW_VERSION_MUTATION,
        {
          coreWorkflowVersionId: misroutedCoreWorkflow.coreWorkflowVersionId,
        },
      );

      expect(activateResponse.body.errors).toBeDefined();
      expect(activateResponse.body.errors[0].message).toContain(
        'many-to-one relation',
      );
      expect(activateResponse.body.data?.activateCoreWorkflowVersion).not.toBe(
        true,
      );
    } finally {
      await deleteCoreWorkflows([misroutedCoreWorkflow.coreWorkflowId]);
    }
  });
});

import request from 'supertest';
import { updateWorkflowVersionTrigger } from 'test/integration/graphql/suites/workflow/utils/update-workflow-version-trigger.util';
import { isDefined } from 'twenty-shared/utils';

const POLL_ATTEMPTS = 20;
const POLL_INTERVAL_MS = 250;

const client = request(`http://localhost:${APP_PORT}`);

const graphql = (query: string, variables?: object) =>
  client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({ query, variables });

const CORE_WORKFLOWS_QUERY = `
  query CoreWorkflows($statuses: [CoreWorkflowStatus!], $searchTerm: String) {
    coreWorkflows(first: 200, statuses: $statuses, searchTerm: $searchTerm) {
      edges {
        node {
          id
          name
          statuses
          applicationId
          workspaceWorkflowId
          updatedAt
        }
        cursor
      }
      pageInfo {
        endCursor
        hasNextPage
      }
      totalCount
    }
  }
`;

type CoreWorkflow = {
  id: string;
  name: string | null;
  statuses: string[];
  applicationId: string | null;
  workspaceWorkflowId: string | null;
  updatedAt: string;
};

describe('coreWorkflows (e2e)', () => {
  let workflowId: string;
  let firstVersionId: string;
  let alreadyDestroyed = false;

  const findCoreWorkflow = async (variables?: {
    statuses?: string[];
    searchTerm?: string;
  }): Promise<CoreWorkflow | undefined> => {
    const response = await graphql(CORE_WORKFLOWS_QUERY, variables);

    expect(response.body.errors).toBeUndefined();

    return (response.body.data.coreWorkflows.edges as { node: CoreWorkflow }[])
      .map((edge) => edge.node)
      .find((workflow) => workflow.workspaceWorkflowId === workflowId);
  };

  // the core mirror and the statuses update are async listeners, so the row
  // lands shortly after the mutation returns rather than within it
  const waitForCoreWorkflow = async (
    predicate: (workflow: CoreWorkflow | undefined) => boolean,
  ): Promise<CoreWorkflow | undefined> => {
    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
      const coreWorkflow = await findCoreWorkflow();

      if (predicate(coreWorkflow)) {
        return coreWorkflow;
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }

    return findCoreWorkflow();
  };

  beforeAll(async () => {
    const createResponse = await graphql(`
      mutation {
        createWorkflow(data: { name: "Core Workflows List" }) {
          id
        }
      }
    `);

    expect(createResponse.body.errors).toBeUndefined();
    workflowId = createResponse.body.data.createWorkflow.id;

    const getResponse = await graphql(
      `
        query GetWorkflow($id: UUID!) {
          workflow(filter: { id: { eq: $id } }) {
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
      { id: workflowId },
    );

    firstVersionId = getResponse.body.data.workflow.versions.edges[0].node.id;
  });

  afterAll(async () => {
    if (alreadyDestroyed) {
      return;
    }

    await graphql(
      `
        mutation DestroyWorkflow($id: UUID!) {
          destroyWorkflow(id: $id) {
            id
          }
        }
      `,
      { id: workflowId },
    );
  });

  it('should list the workflow as DRAFT right after creation', async () => {
    const coreWorkflow = await waitForCoreWorkflow((workflow) =>
      isDefined(workflow),
    );

    expect(coreWorkflow).toBeDefined();
    expect(coreWorkflow?.name).toBe('Core Workflows List');
    expect(coreWorkflow?.statuses).toEqual(['DRAFT']);
  });

  it('should filter by derived statuses', async () => {
    await waitForCoreWorkflow(
      (workflow) => workflow?.statuses.includes('DRAFT') === true,
    );

    const draftFiltered = await findCoreWorkflow({ statuses: ['DRAFT'] });

    expect(draftFiltered?.statuses).toEqual(['DRAFT']);

    const activeOrDeactivatedFiltered = await findCoreWorkflow({
      statuses: ['ACTIVE', 'DEACTIVATED'],
    });

    expect(activeOrDeactivatedFiltered).toBeUndefined();
  });

  it('should filter by search term with a case-insensitive name match', async () => {
    await waitForCoreWorkflow((workflow) => isDefined(workflow));

    const matching = await findCoreWorkflow({
      searchTerm: 'core workflows li',
    });

    expect(matching?.name).toBe('Core Workflows List');

    const notMatching = await findCoreWorkflow({
      searchTerm: 'no workflow bears this name',
    });

    expect(notMatching).toBeUndefined();
  });

  it('should compose statuses and search term filters', async () => {
    await waitForCoreWorkflow(
      (workflow) => workflow?.statuses.includes('DRAFT') === true,
    );

    const filtered = await findCoreWorkflow({
      statuses: ['DRAFT'],
      searchTerm: 'CORE WORKFLOWS LIST',
    });

    expect(filtered?.statuses).toEqual(['DRAFT']);

    const filteredOut = await findCoreWorkflow({
      statuses: ['ACTIVE'],
      searchTerm: 'CORE WORKFLOWS LIST',
    });

    expect(filteredOut).toBeUndefined();
  });

  it('should list the workflow as ACTIVE once its version is activated', async () => {
    await updateWorkflowVersionTrigger({
      workflowVersionId: firstVersionId,
      trigger: {
        name: 'Manual Trigger',
        type: 'MANUAL',
        settings: { outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

    const stepResponse = await graphql(
      `
        mutation CreateWorkflowVersionStep(
          $input: CreateWorkflowVersionStepInput!
        ) {
          createWorkflowVersionStep(input: $input) {
            stepsDiff
          }
        }
      `,
      {
        input: {
          workflowVersionId: firstVersionId,
          stepType: 'FIND_RECORDS',
          parentStepId: 'trigger',
          position: { x: 200, y: 0 },
        },
      },
    );

    expect(stepResponse.body.errors).toBeUndefined();

    const activateResponse = await graphql(
      `
        mutation ActivateWorkflowVersion($workflowVersionId: UUID!) {
          activateWorkflowVersion(workflowVersionId: $workflowVersionId)
        }
      `,
      { workflowVersionId: firstVersionId },
    );

    expect(activateResponse.body.errors).toBeUndefined();

    const coreWorkflow = await waitForCoreWorkflow(
      (workflow) => workflow?.statuses[0] === 'ACTIVE',
    );

    expect(coreWorkflow?.statuses).toEqual(['ACTIVE']);
  });

  it('should list the workflow as DEACTIVATED once its version is deactivated', async () => {
    const deactivateResponse = await graphql(
      `
        mutation DeactivateWorkflowVersion($workflowVersionId: UUID!) {
          deactivateWorkflowVersion(workflowVersionId: $workflowVersionId)
        }
      `,
      { workflowVersionId: firstVersionId },
    );

    expect(deactivateResponse.body.errors).toBeUndefined();

    const coreWorkflow = await waitForCoreWorkflow(
      (workflow) => workflow?.statuses[0] === 'DEACTIVATED',
    );

    expect(coreWorkflow?.statuses).toEqual(['DEACTIVATED']);
  });

  it('should paginate with a stable keyset cursor', async () => {
    const firstPageResponse = await graphql(`
      query {
        coreWorkflows(first: 1, orderBy: NAME, orderByDirection: ASC) {
          edges {
            node {
              id
            }
            cursor
          }
          pageInfo {
            endCursor
            hasNextPage
          }
          totalCount
        }
      }
    `);

    expect(firstPageResponse.body.errors).toBeUndefined();

    const firstPage = firstPageResponse.body.data.coreWorkflows;

    expect(firstPage.edges).toHaveLength(1);
    expect(firstPage.totalCount).toBeGreaterThanOrEqual(1);

    if (!firstPage.pageInfo.hasNextPage) {
      return;
    }

    const secondPageResponse = await graphql(
      `
        query SecondPage($after: String!) {
          coreWorkflows(
            first: 1
            after: $after
            orderBy: NAME
            orderByDirection: ASC
          ) {
            edges {
              node {
                id
              }
              cursor
            }
          }
        }
      `,
      { after: firstPage.pageInfo.endCursor },
    );

    expect(secondPageResponse.body.errors).toBeUndefined();

    const secondPage = secondPageResponse.body.data.coreWorkflows;

    expect(secondPage.edges[0].node.id).not.toBe(firstPage.edges[0].node.id);
  });

  it('should not list the workflow once it is destroyed', async () => {
    await graphql(
      `
        mutation DestroyWorkflow($id: UUID!) {
          destroyWorkflow(id: $id) {
            id
          }
        }
      `,
      { id: workflowId },
    );

    alreadyDestroyed = true;

    const coreWorkflow = await waitForCoreWorkflow(
      (workflow) => !isDefined(workflow),
    );

    expect(coreWorkflow).toBeUndefined();
  });
});

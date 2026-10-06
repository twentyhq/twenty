import {
  activateCoreWorkflowVersion,
  CORE_WORKFLOW_MANUAL_TRIGGER,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deactivateCoreWorkflowVersion,
  DELETE_CORE_WORKFLOWS_MUTATION,
  deleteCoreWorkflows,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow-test.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
import { isDefined } from 'twenty-shared/utils';

const CORE_WORKFLOWS_QUERY = `
  query CoreWorkflows($filter: CoreWorkflowFilterInput) {
    coreWorkflows(first: 200, filter: $filter) {
      edges {
        node {
          id
          name
          statuses
          applicationId
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

type ListedCoreWorkflow = {
  id: string;
  name: string | null;
  statuses: string[];
  applicationId: string | null;
  updatedAt: string;
};

type CoreWorkflowFilterRule = {
  fieldKey: 'NAME' | 'STATUSES' | 'UPDATED_AT';
  operand:
    | 'CONTAINS'
    | 'DOES_NOT_CONTAIN'
    | 'IS'
    | 'IS_NOT'
    | 'IS_EMPTY'
    | 'IS_NOT_EMPTY'
    | 'IS_BEFORE'
    | 'IS_AFTER';
  value?: string;
};

type CoreWorkflowFilter = {
  logicalOperator: 'AND' | 'OR';
  rules: CoreWorkflowFilterRule[];
};

describe('coreWorkflows (e2e)', () => {
  let coreWorkflowId: string;
  let firstCoreWorkflowVersionId: string;
  let deletedWhileActiveCoreWorkflowId: string | undefined;

  const listCoreWorkflows = async (
    filter?: CoreWorkflowFilter,
  ): Promise<ListedCoreWorkflow[]> => {
    const response = await workflowGraphqlRequest(CORE_WORKFLOWS_QUERY, {
      filter,
    });

    expect(response.body.errors).toBeUndefined();

    const { edges, pageInfo, totalCount } = response.body.data
      .coreWorkflows as {
      edges: { node: ListedCoreWorkflow }[];
      pageInfo: { hasNextPage: boolean };
      totalCount: number;
    };

    if (!pageInfo.hasNextPage) {
      expect(totalCount).toBe(edges.length);
    }

    return edges.map((edge) => edge.node);
  };

  const findListedCoreWorkflowById = async (
    id: string,
    filter?: CoreWorkflowFilter,
  ): Promise<ListedCoreWorkflow | undefined> =>
    (await listCoreWorkflows(filter)).find((workflow) => workflow.id === id);

  const findCoreWorkflow = async (
    filter?: CoreWorkflowFilter,
  ): Promise<ListedCoreWorkflow | undefined> =>
    findListedCoreWorkflowById(coreWorkflowId, filter);

  beforeAll(async () => {
    ({ coreWorkflowId, coreWorkflowVersionId: firstCoreWorkflowVersionId } =
      await createCoreWorkflow({ name: 'Core Workflows List' }));
  });

  afterAll(async () => {
    await deleteCoreWorkflows(
      [coreWorkflowId, deletedWhileActiveCoreWorkflowId].filter(isDefined),
    );
  });

  it('should list the workflow as DRAFT right after creation', async () => {
    const coreWorkflow = await findCoreWorkflow();

    expect(coreWorkflow).toBeDefined();
    expect(coreWorkflow?.name).toBe('Core Workflows List');
    expect(coreWorkflow?.statuses).toEqual(['DRAFT']);
  });

  it('should filter by derived statuses', async () => {
    const draftFiltered = await findCoreWorkflow({
      logicalOperator: 'AND',
      rules: [
        {
          fieldKey: 'STATUSES',
          operand: 'CONTAINS',
          value: JSON.stringify(['DRAFT']),
        },
      ],
    });

    expect(draftFiltered?.statuses).toEqual(['DRAFT']);

    const activeOrDeactivatedFiltered = await findCoreWorkflow({
      logicalOperator: 'AND',
      rules: [
        {
          fieldKey: 'STATUSES',
          operand: 'CONTAINS',
          value: JSON.stringify(['ACTIVE', 'DEACTIVATED']),
        },
      ],
    });

    expect(activeOrDeactivatedFiltered).toBeUndefined();
  });

  it('should filter by a case-insensitive name match', async () => {
    const matching = await findCoreWorkflow({
      logicalOperator: 'AND',
      rules: [
        { fieldKey: 'NAME', operand: 'CONTAINS', value: 'core workflows li' },
      ],
    });

    expect(matching?.name).toBe('Core Workflows List');

    const notMatching = await findCoreWorkflow({
      logicalOperator: 'AND',
      rules: [
        {
          fieldKey: 'NAME',
          operand: 'CONTAINS',
          value: 'no workflow bears this name',
        },
      ],
    });

    expect(notMatching).toBeUndefined();
  });

  it('should compose a status rule and a name rule with AND', async () => {
    const filtered = await findCoreWorkflow({
      logicalOperator: 'AND',
      rules: [
        {
          fieldKey: 'STATUSES',
          operand: 'CONTAINS',
          value: JSON.stringify(['DRAFT']),
        },
        { fieldKey: 'NAME', operand: 'CONTAINS', value: 'CORE WORKFLOWS LIST' },
      ],
    });

    expect(filtered?.statuses).toEqual(['DRAFT']);

    const filteredOut = await findCoreWorkflow({
      logicalOperator: 'AND',
      rules: [
        {
          fieldKey: 'STATUSES',
          operand: 'CONTAINS',
          value: JSON.stringify(['ACTIVE']),
        },
        { fieldKey: 'NAME', operand: 'CONTAINS', value: 'CORE WORKFLOWS LIST' },
      ],
    });

    expect(filteredOut).toBeUndefined();
  });

  it('should compose a name rule and a status rule with OR', async () => {
    const matchedByStatusOnly = await findCoreWorkflow({
      logicalOperator: 'OR',
      rules: [
        {
          fieldKey: 'NAME',
          operand: 'CONTAINS',
          value: 'no workflow bears this name',
        },
        {
          fieldKey: 'STATUSES',
          operand: 'CONTAINS',
          value: JSON.stringify(['DRAFT']),
        },
      ],
    });

    expect(matchedByStatusOnly?.statuses).toEqual(['DRAFT']);

    const matchedByNeither = await findCoreWorkflow({
      logicalOperator: 'OR',
      rules: [
        {
          fieldKey: 'NAME',
          operand: 'CONTAINS',
          value: 'no workflow bears this name',
        },
        {
          fieldKey: 'STATUSES',
          operand: 'CONTAINS',
          value: JSON.stringify(['ACTIVE']),
        },
      ],
    });

    expect(matchedByNeither).toBeUndefined();
  });

  it('should filter by update date', async () => {
    const coreWorkflow = await findCoreWorkflow();

    expect(coreWorkflow).toBeDefined();

    const updatedAt = new Date(coreWorkflow?.updatedAt ?? '');
    const oneHourBefore = new Date(updatedAt.getTime() - 60 * 60 * 1000);

    const updatedAfter = await findCoreWorkflow({
      logicalOperator: 'AND',
      rules: [
        {
          fieldKey: 'UPDATED_AT',
          operand: 'IS_AFTER',
          value: JSON.stringify(oneHourBefore.toISOString()),
        },
      ],
    });

    expect(updatedAfter?.id).toBe(coreWorkflowId);

    const updatedBefore = await findCoreWorkflow({
      logicalOperator: 'AND',
      rules: [
        {
          fieldKey: 'UPDATED_AT',
          operand: 'IS_BEFORE',
          value: JSON.stringify(oneHourBefore.toISOString()),
        },
      ],
    });

    expect(updatedBefore).toBeUndefined();

    const updatedOnTheSameDay = await findCoreWorkflow({
      logicalOperator: 'AND',
      rules: [
        {
          fieldKey: 'UPDATED_AT',
          operand: 'IS',
          value: JSON.stringify(updatedAt.toISOString()),
        },
      ],
    });

    expect(updatedOnTheSameDay?.id).toBe(coreWorkflowId);
  });

  it('should reject an operand the field does not support', async () => {
    const response = await workflowGraphqlRequest(CORE_WORKFLOWS_QUERY, {
      filter: {
        logicalOperator: 'AND',
        rules: [{ fieldKey: 'STATUSES', operand: 'IS', value: 'ACTIVE' }],
      },
    });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain(
      'Operand IS is not supported on field STATUSES',
    );
  });

  it('should list the workflow as ACTIVE once its version is activated', async () => {
    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId: firstCoreWorkflowVersionId,
      trigger: CORE_WORKFLOW_MANUAL_TRIGGER,
    });

    await createCoreWorkflowVersionStep({
      coreWorkflowVersionId: firstCoreWorkflowVersionId,
      stepType: 'FIND_RECORDS',
    });

    await activateCoreWorkflowVersion(firstCoreWorkflowVersionId);

    const coreWorkflow = await findCoreWorkflow();

    expect(coreWorkflow?.statuses).toEqual(['ACTIVE']);
  });

  it('should list the workflow as DEACTIVATED once its version is deactivated', async () => {
    await deactivateCoreWorkflowVersion(firstCoreWorkflowVersionId);

    const coreWorkflow = await findCoreWorkflow();

    expect(coreWorkflow?.statuses).toEqual(['DEACTIVATED']);
  });

  it('should paginate with a stable keyset cursor', async () => {
    const firstPageResponse = await workflowGraphqlRequest(`
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

    const secondPageResponse = await workflowGraphqlRequest(
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

  it('should not list an active workflow once it is deleted', async () => {
    const { coreWorkflowId: activeCoreWorkflowId, coreWorkflowVersionId } =
      await createCoreWorkflow({ name: 'Core Workflows Deleted While Active' });

    deletedWhileActiveCoreWorkflowId = activeCoreWorkflowId;

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId,
      trigger: CORE_WORKFLOW_MANUAL_TRIGGER,
    });

    await createCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      stepType: 'FIND_RECORDS',
    });

    await activateCoreWorkflowVersion(coreWorkflowVersionId);

    const activated = await findListedCoreWorkflowById(activeCoreWorkflowId);

    expect(activated?.statuses).toEqual(['ACTIVE']);

    const deleteResponse = await workflowGraphqlRequest(
      DELETE_CORE_WORKFLOWS_MUTATION,
      { input: { coreWorkflowIds: [activeCoreWorkflowId] } },
    );

    expect(deleteResponse.body.errors).toBeUndefined();

    expect(
      await findListedCoreWorkflowById(activeCoreWorkflowId),
    ).toBeUndefined();
  });

  it('should not list the workflow once it is destroyed', async () => {
    const deleteResponse = await workflowGraphqlRequest(
      DELETE_CORE_WORKFLOWS_MUTATION,
      { input: { coreWorkflowIds: [coreWorkflowId] } },
    );

    expect(deleteResponse.body.errors).toBeUndefined();

    expect(await findCoreWorkflow()).toBeUndefined();
  });
});

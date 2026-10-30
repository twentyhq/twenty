import gql from 'graphql-tag';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  activateCoreWorkflowVersion,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  runCoreWorkflowVersion,
  updateCoreWorkflowVersionStep,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import {
  destroyWorkflowRun,
  waitForWorkflowCompletion,
} from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { v4 as uuidv4 } from 'uuid';

const TEST_COMPANY_AIRBNB_ID = '20202020-eeee-4000-8000-000000000001';
const TEST_COMPANY_STRIPE_ID = '20202020-eeee-4000-8000-000000000002';
const TEST_PERSON_AIRBNB_1_ID = '20202020-ffff-4000-8000-000000000001';
const TEST_PERSON_AIRBNB_2_ID = '20202020-ffff-4000-8000-000000000002';
const TEST_PERSON_STRIPE_1_ID = '20202020-ffff-4000-8000-000000000003';
const ALL_TEST_PERSON_IDS = [
  TEST_PERSON_AIRBNB_1_ID,
  TEST_PERSON_AIRBNB_2_ID,
  TEST_PERSON_STRIPE_1_ID,
];
const ALL_TEST_COMPANY_IDS = [TEST_COMPANY_AIRBNB_ID, TEST_COMPANY_STRIPE_ID];

describe('FindRecords workflow action with relation-traversal filter (e2e)', () => {
  let coreWorkflowId: string | null = null;
  let coreWorkflowVersionId: string | null = null;
  let findRecordsStepId: string | null = null;
  const createdWorkflowRunIds: string[] = [];
  let personCompanyFieldMetadataId: string | null = null;
  let companyNameFieldMetadataId: string | null = null;

  const lookupFieldMetadataIds = async () => {
    const objectsResponse = await makeMetadataApiRequest({
      query: gql`
        query Objects($filter: ObjectFilter!, $paging: CursorPaging!) {
          objects(filter: $filter, paging: $paging) {
            edges {
              node {
                nameSingular
                fieldsList {
                  id
                  name
                }
              }
            }
          }
        }
      `,
      variables: { paging: { first: 1000 }, filter: {} },
    });

    expect(objectsResponse.body.errors).toBeUndefined();

    const objects: Array<{
      nameSingular: string;
      fieldsList: Array<{ id: string; name: string }>;
    }> = objectsResponse.body.data.objects.edges.map(
      (edge: { node: unknown }) => edge.node,
    );

    const personObject = objects.find((o) => o.nameSingular === 'person');
    const companyObject = objects.find((o) => o.nameSingular === 'company');

    personCompanyFieldMetadataId =
      personObject?.fieldsList.find((f) => f.name === 'company')?.id ?? null;
    companyNameFieldMetadataId =
      companyObject?.fieldsList.find((f) => f.name === 'name')?.id ?? null;

    if (!personCompanyFieldMetadataId || !companyNameFieldMetadataId) {
      throw new Error(
        `Could not resolve required field metadata ids — person.company=${personCompanyFieldMetadataId}, company.name=${companyNameFieldMetadataId}`,
      );
    }
  };

  const seedTestRecords = async () => {
    await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        data: [
          { id: TEST_COMPANY_AIRBNB_ID, name: 'AirbnbWorkflowTest' },
          { id: TEST_COMPANY_STRIPE_ID, name: 'StripeWorkflowTest' },
        ],
        upsert: true,
      }),
    );

    await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        data: [
          {
            id: TEST_PERSON_AIRBNB_1_ID,
            companyId: TEST_COMPANY_AIRBNB_ID,
            jobTitle: 'workflow-test-airbnb-1',
          },
          {
            id: TEST_PERSON_AIRBNB_2_ID,
            companyId: TEST_COMPANY_AIRBNB_ID,
            jobTitle: 'workflow-test-airbnb-2',
          },
          {
            id: TEST_PERSON_STRIPE_1_ID,
            companyId: TEST_COMPANY_STRIPE_ID,
            jobTitle: 'workflow-test-stripe-1',
          },
        ],
        upsert: true,
      }),
    );
  };

  const buildWorkflow = async () => {
    const coreWorkflow = await createCoreWorkflow({
      name: 'Relation Traversal Find Records Test',
    });

    coreWorkflowId = coreWorkflow.coreWorkflowId;
    coreWorkflowVersionId = coreWorkflow.coreWorkflowVersionId;

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId,
      trigger: {
        name: 'Manual Trigger',
        type: 'MANUAL',
        settings: { outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

    const findRecordsStep = await createCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      stepType: 'FIND_RECORDS',
    });

    findRecordsStepId = findRecordsStep.id;

    const filterGroupId = uuidv4();
    const filterId = uuidv4();

    await updateCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      step: {
        ...findRecordsStep,
        settings: {
          ...findRecordsStep.settings,
          input: {
            ...findRecordsStep.settings.input,
            objectName: 'person',
            limit: 25,
            filter: {
              recordFilters: [
                {
                  id: filterId,
                  value: '{{trigger.companyName}}',
                  operand: 'CONTAINS',
                  fieldMetadataId: personCompanyFieldMetadataId,
                  relationTargetFieldMetadataId: companyNameFieldMetadataId,
                  recordFilterGroupId: filterGroupId,
                },
              ],
              recordFilterGroups: [
                { id: filterGroupId, logicalOperator: 'AND' },
              ],
            },
          },
        },
      },
    });

    await activateCoreWorkflowVersion({ coreWorkflowVersionId });
  };

  const runWithCompanyName = async (companyName: string | null) => {
    const workflowRunId = await runCoreWorkflowVersion({
      coreWorkflowVersionId: coreWorkflowVersionId!,
      payload: { companyName },
    });

    createdWorkflowRunIds.push(workflowRunId);

    return waitForWorkflowCompletion(workflowRunId);
  };

  beforeAll(async () => {
    await lookupFieldMetadataIds();
    await seedTestRecords();
    await buildWorkflow();
  });

  afterAll(async () => {
    for (const workflowRunId of createdWorkflowRunIds) {
      await destroyWorkflowRun(workflowRunId);
    }
    if (coreWorkflowId) {
      await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
    }
    await makeGraphqlApiRequest(
      deleteManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        filter: { id: { in: ALL_TEST_PERSON_IDS } },
      }),
    );
    await makeGraphqlApiRequest(
      deleteManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        filter: { id: { in: ALL_TEST_COMPANY_IDS } },
      }),
    );
  });

  it('should apply a one-hop relation-traversal filter and return only matching records', async () => {
    const workflowRun = await runWithCompanyName('AirbnbWorkflowTest');

    expect(workflowRun?.status).toBe('COMPLETED');
    expect(workflowRun?.state?.stepInfos?.[findRecordsStepId!]?.status).toBe(
      'SUCCESS',
    );

    const result = workflowRun?.state?.stepInfos?.[findRecordsStepId!]
      ?.result as
      | { all?: Array<{ id: string }>; totalCount?: number }
      | undefined;

    const returnedIds = (result?.all ?? []).map((record) => record.id);

    expect(returnedIds).toContain(TEST_PERSON_AIRBNB_1_ID);
    expect(returnedIds).toContain(TEST_PERSON_AIRBNB_2_ID);
    expect(returnedIds).not.toContain(TEST_PERSON_STRIPE_1_ID);
  });

  it('should complete the run when the filter value resolves to empty', async () => {
    const workflowRun = await runWithCompanyName(null);

    expect(workflowRun?.status).toBe('COMPLETED');
    expect(workflowRun?.state?.stepInfos?.[findRecordsStepId!]?.status).toBe(
      'SUCCESS',
    );

    const result = workflowRun?.state?.stepInfos?.[findRecordsStepId!]
      ?.result as
      | {
          all?: Array<{ id: string }>;
          totalCount?: number | string;
        }
      | undefined;

    const returnedRecords = result?.all;

    expect(Array.isArray(returnedRecords)).toBe(true);
    expect(Number.isFinite(Number(result?.totalCount))).toBe(true);

    // other specs sharing the database leave people on unnamed companies, which an empty company name also matches
    const returnedIds = (returnedRecords ?? []).map((record) => record.id);

    expect(
      returnedIds.filter((id) => ALL_TEST_PERSON_IDS.includes(id)),
    ).toEqual([]);
  });
});

import gql from 'graphql-tag';
import request from 'supertest';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateWorkflowVersionTrigger } from 'test/integration/graphql/suites/workflow/utils/update-workflow-version-trigger.util';
import {
  destroyWorkflowRun,
  runWorkflowVersion,
  waitForWorkflowCompletion,
} from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { v4 as uuidv4 } from 'uuid';

const client = request(`http://localhost:${APP_PORT}`);

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
  let createdWorkflowId: string | null = null;
  let createdWorkflowVersionId: string | null = null;
  let findRecordsStepId: string | null = null;
  let createdWorkflowRunId: string | null = null;
  let personCompanyFieldMetadataId: string | null = null;
  let companyNameFieldMetadataId: string | null = null;

  const lookupFieldMetadataIds = async () => {
    const objectsResponse = await makeMetadataAPIRequest({
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
    await makeGraphqlAPIRequest(
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

    await makeGraphqlAPIRequest(
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
    const createWorkflowResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation CreateWorkflow {
            createWorkflow(data: { name: "Relation Traversal Find Records Test" }) {
              id
            }
          }
        `,
      });

    expect(createWorkflowResponse.body.errors).toBeUndefined();
    createdWorkflowId = createWorkflowResponse.body.data.createWorkflow.id;

    const getWorkflowResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          query GetWorkflow($id: UUID!) {
            workflow(filter: { id: { eq: $id } }) {
              id
              versions { edges { node { id } } }
            }
          }
        `,
        variables: { id: createdWorkflowId },
      });

    createdWorkflowVersionId =
      getWorkflowResponse.body.data.workflow.versions.edges[0].node.id;

    await updateWorkflowVersionTrigger({
      workflowVersionId: createdWorkflowVersionId!,
      trigger: {
        name: 'Manual Trigger',
        type: 'MANUAL',
        settings: { outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

    const createStepResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation CreateWorkflowVersionStep($input: CreateWorkflowVersionStepInput!) {
            createWorkflowVersionStep(input: $input) { stepsDiff }
          }
        `,
        variables: {
          input: {
            workflowVersionId: createdWorkflowVersionId,
            stepType: 'FIND_RECORDS',
            parentStepId: 'trigger',
            position: { x: 200, y: 0 },
          },
        },
      });

    expect(createStepResponse.body.errors).toBeUndefined();

    const getVersionResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          query GetWorkflowVersion($id: UUID!) {
            workflowVersion(filter: { id: { eq: $id } }) { steps }
          }
        `,
        variables: { id: createdWorkflowVersionId },
      });

    const steps = getVersionResponse.body.data.workflowVersion.steps;
    const findRecordsStep = steps.find(
      (step: { type: string }) => step.type === 'FIND_RECORDS',
    );

    expect(findRecordsStep).toBeDefined();
    findRecordsStepId = findRecordsStep.id;

    const filterGroupId = uuidv4();
    const filterId = uuidv4();

    const updateStepResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation UpdateWorkflowVersionStep($input: UpdateWorkflowVersionStepInput!) {
            updateWorkflowVersionStep(input: $input) { id }
          }
        `,
        variables: {
          input: {
            workflowVersionId: createdWorkflowVersionId,
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
                        type: 'TEXT',
                        label: 'Company → Name',
                        value: 'AirbnbWorkflowTest',
                        operand: 'CONTAINS',
                        displayValue: 'AirbnbWorkflowTest',
                        fieldMetadataId: personCompanyFieldMetadataId,
                        relationTargetFieldMetadataId:
                          companyNameFieldMetadataId,
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
          },
        },
      });

    expect(updateStepResponse.body.errors).toBeUndefined();

    const activateResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation ActivateWorkflowVersion($workflowVersionId: UUID!) {
            activateWorkflowVersion(workflowVersionId: $workflowVersionId)
          }
        `,
        variables: { workflowVersionId: createdWorkflowVersionId },
      });

    expect(activateResponse.body.errors).toBeUndefined();
  };

  beforeAll(async () => {
    await lookupFieldMetadataIds();
    await seedTestRecords();
    await buildWorkflow();
  });

  afterAll(async () => {
    if (createdWorkflowRunId) {
      await destroyWorkflowRun(createdWorkflowRunId);
    }
    if (createdWorkflowId) {
      await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `mutation DestroyWorkflow($id: ID!) { destroyWorkflow(id: $id) { id } }`,
          variables: { id: createdWorkflowId },
        });
    }
    await makeGraphqlAPIRequest(
      deleteManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        filter: { id: { in: ALL_TEST_PERSON_IDS } },
      }),
    );
    await makeGraphqlAPIRequest(
      deleteManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        filter: { id: { in: ALL_TEST_COMPANY_IDS } },
      }),
    );
  });

  it('should apply a one-hop relation-traversal filter and return only matching records', async () => {
    const workflowRunId = await runWorkflowVersion({
      workflowVersionId: createdWorkflowVersionId!,
    });

    createdWorkflowRunId = workflowRunId;

    const workflowRun = await waitForWorkflowCompletion(workflowRunId);

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
});

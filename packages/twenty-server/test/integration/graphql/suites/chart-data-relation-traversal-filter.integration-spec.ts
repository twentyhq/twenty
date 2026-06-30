import gql from 'graphql-tag';
import request from 'supertest';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { v4 as uuidv4 } from 'uuid';

const client = request(`http://localhost:${APP_PORT}`);

const TEST_COMPANY_AIRBNB_ID = '20202020-aaaa-4000-8000-000000000001';
const TEST_COMPANY_STRIPE_ID = '20202020-aaaa-4000-8000-000000000002';
const TEST_PERSON_AIRBNB_1_ID = '20202020-bbbb-4000-8000-000000000001';
const TEST_PERSON_AIRBNB_2_ID = '20202020-bbbb-4000-8000-000000000002';
const TEST_PERSON_STRIPE_1_ID = '20202020-bbbb-4000-8000-000000000003';
const SHARED_JOB_TITLE = 'chart-test-relation-traversal';
const ALL_TEST_PERSON_IDS = [
  TEST_PERSON_AIRBNB_1_ID,
  TEST_PERSON_AIRBNB_2_ID,
  TEST_PERSON_STRIPE_1_ID,
];
const ALL_TEST_COMPANY_IDS = [TEST_COMPANY_AIRBNB_ID, TEST_COMPANY_STRIPE_ID];

describe('BarChartData with relation-traversal filter (e2e)', () => {
  let personObjectMetadataId: string | null = null;
  let personIdFieldMetadataId: string | null = null;
  let personJobTitleFieldMetadataId: string | null = null;
  let personCompanyFieldMetadataId: string | null = null;
  let companyNameFieldMetadataId: string | null = null;

  const lookupMetadataIds = async () => {
    const objectsResponse = await makeMetadataAPIRequest({
      query: gql`
        query Objects($filter: ObjectFilter!, $paging: CursorPaging!) {
          objects(filter: $filter, paging: $paging) {
            edges {
              node {
                id
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
      id: string;
      nameSingular: string;
      fieldsList: Array<{ id: string; name: string }>;
    }> = objectsResponse.body.data.objects.edges.map(
      (edge: { node: unknown }) => edge.node,
    );

    const personObject = objects.find((o) => o.nameSingular === 'person');
    const companyObject = objects.find((o) => o.nameSingular === 'company');

    personObjectMetadataId = personObject?.id ?? null;
    personIdFieldMetadataId =
      personObject?.fieldsList.find((f) => f.name === 'id')?.id ?? null;
    personJobTitleFieldMetadataId =
      personObject?.fieldsList.find((f) => f.name === 'jobTitle')?.id ?? null;
    personCompanyFieldMetadataId =
      personObject?.fieldsList.find((f) => f.name === 'company')?.id ?? null;
    companyNameFieldMetadataId =
      companyObject?.fieldsList.find((f) => f.name === 'name')?.id ?? null;

    if (
      !personObjectMetadataId ||
      !personIdFieldMetadataId ||
      !personJobTitleFieldMetadataId ||
      !personCompanyFieldMetadataId ||
      !companyNameFieldMetadataId
    ) {
      throw new Error('Failed to resolve required metadata ids for chart test');
    }
  };

  const seedTestRecords = async () => {
    await makeGraphqlAPIRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        data: [
          { id: TEST_COMPANY_AIRBNB_ID, name: 'AirbnbChartTest' },
          { id: TEST_COMPANY_STRIPE_ID, name: 'StripeChartTest' },
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
            jobTitle: SHARED_JOB_TITLE,
          },
          {
            id: TEST_PERSON_AIRBNB_2_ID,
            companyId: TEST_COMPANY_AIRBNB_ID,
            jobTitle: SHARED_JOB_TITLE,
          },
          {
            id: TEST_PERSON_STRIPE_1_ID,
            companyId: TEST_COMPANY_STRIPE_ID,
            jobTitle: SHARED_JOB_TITLE,
          },
        ],
        upsert: true,
      }),
    );
  };

  const queryBarChartCount = async (extraRecordFilters: object[] = []) => {
    const filterGroupId = uuidv4();
    const allRecordFilters = [
      {
        id: uuidv4(),
        type: 'TEXT',
        operand: 'CONTAINS',
        value: SHARED_JOB_TITLE,
        fieldMetadataId: personJobTitleFieldMetadataId,
        recordFilterGroupId: filterGroupId,
      },
      ...extraRecordFilters.map((filter) => ({
        ...filter,
        recordFilterGroupId: filterGroupId,
      })),
    ];

    const response = await client
      .post('/metadata')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          query BarChartData($input: BarChartDataInput!) {
            barChartData(input: $input) {
              data
              indexBy
              keys
            }
          }
        `,
        variables: {
          input: {
            objectMetadataId: personObjectMetadataId,
            configuration: {
              configurationType: 'BAR_CHART',
              layout: 'VERTICAL',
              aggregateFieldMetadataId: personIdFieldMetadataId,
              aggregateOperation: 'COUNT',
              primaryAxisGroupByFieldMetadataId: personJobTitleFieldMetadataId,
              primaryAxisOrderBy: 'VALUE_DESC',
              filter: {
                recordFilters: allRecordFilters,
                recordFilterGroups: [
                  { id: filterGroupId, logicalOperator: 'AND' },
                ],
              },
            },
          },
        },
      });

    expect(response.body.errors).toBeUndefined();
    const data: Array<Record<string, string | number>> =
      response.body.data.barChartData.data;
    const row = data.find((entry) => entry.jobTitle === SHARED_JOB_TITLE);

    return typeof row?.id === 'number' ? row.id : 0;
  };

  beforeAll(async () => {
    await lookupMetadataIds();
    await seedTestRecords();
  });

  afterAll(async () => {
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

  it('should count all 3 test people without a relation-traversal filter', async () => {
    const count = await queryBarChartCount();

    expect(count).toBe(3);
  });

  it('should apply a one-hop relation-traversal filter and only count Airbnb people', async () => {
    const count = await queryBarChartCount([
      {
        id: uuidv4(),
        type: 'TEXT',
        operand: 'CONTAINS',
        value: 'AirbnbChartTest',
        fieldMetadataId: personCompanyFieldMetadataId,
        relationTargetFieldMetadataId: companyNameFieldMetadataId,
      },
    ]);

    expect(count).toBe(2);
  });
});

import gql from 'graphql-tag';
import request from 'supertest';
import { Temporal } from 'temporal-polyfill';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { v4 as uuidv4 } from 'uuid';

const TOKEN = 'BarChartGroupModeLimit';
const DAY_COUNT = 60;

const destroyTestCompanies = () =>
  makeGraphqlApiRequest(
    destroyManyOperationFactory({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      gqlFields: 'id',
      filter: { name: { like: `${TOKEN}%` } },
    }),
  );

describe('BarChartData with no stored group mode (e2e)', () => {
  let companyObjectMetadataId = '';
  let companyFieldIdByName: Record<string, string> = {};

  beforeAll(async () => {
    const objectsResponse = await makeMetadataApiRequest({
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

    const companyObject = objectsResponse.body.data.objects.edges
      .map(
        (edge: {
          node: {
            id: string;
            nameSingular: string;
            fieldsList: { id: string; name: string }[];
          };
        }) => edge.node,
      )
      .find(
        ({ nameSingular }: { nameSingular: string }) =>
          nameSingular === 'company',
      );

    companyObjectMetadataId = companyObject.id;
    companyFieldIdByName = Object.fromEntries(
      companyObject.fieldsList.map(
        ({ id, name }: { id: string; name: string }) => [name, id],
      ),
    );

    await destroyTestCompanies();

    const firstDay = Temporal.PlainDate.from('2017-01-01');
    // Two names a day for 60 days: 120 groups, more than the 101 a grouped query returns
    const companies = Array.from({ length: DAY_COUNT * 2 }, (_, index) => ({
      name: `${TOKEN} ${index % 2 === 0 ? 'A' : 'B'}`,
      createdAt: firstDay
        .add({ days: Math.floor(index / 2) })
        .toZonedDateTime({ timeZone: 'UTC', plainTime: '12:00' })
        .toInstant()
        .toString(),
    }));

    for (let index = 0; index < companies.length; index += 50) {
      const response = await makeGraphqlApiRequest(
        createManyOperationFactory({
          objectMetadataSingularName: 'company',
          objectMetadataPluralName: 'companies',
          gqlFields: 'id',
          data: companies.slice(index, index + 50),
        }),
      );

      expect(response.body.errors).toBeUndefined();
    }
  });

  afterAll(async () => {
    await destroyTestCompanies();
  });

  it('should size the query of a two-dimensional chart with no group mode as stacked, as it is drawn', async () => {
    const response = await request(`http://localhost:${APP_PORT}`)
      .post('/metadata')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `query BarChartData($input: BarChartDataInput!) { barChartData(input: $input) { data hasTooManyGroups } }`,
        variables: {
          input: {
            objectMetadataId: companyObjectMetadataId,
            configuration: {
              configurationType: 'BAR_CHART',
              layout: 'VERTICAL',
              aggregateFieldMetadataId: companyFieldIdByName.id,
              aggregateOperation: 'COUNT',
              primaryAxisGroupByFieldMetadataId: companyFieldIdByName.createdAt,
              primaryAxisDateGranularity: 'DAY',
              primaryAxisOrderBy: 'FIELD_ASC',
              secondaryAxisGroupByFieldMetadataId: companyFieldIdByName.name,
              timezone: 'UTC',
              filter: {
                recordFilters: [
                  {
                    id: uuidv4(),
                    fieldMetadataId: companyFieldIdByName.name,
                    operand: 'CONTAINS',
                    value: TOKEN,
                  },
                ],
              },
            },
          },
        },
      });

    expect(response.body.errors).toBeUndefined();

    const { data, hasTooManyGroups } = response.body.data.barChartData;
    const total = data
      .flatMap((row: Record<string, string | number>) => Object.values(row))
      .filter((value: string | number) => typeof value === 'number')
      .reduce((sum: number, value: number) => sum + value, 0);

    expect(hasTooManyGroups).toBe(false);
    expect(data).toHaveLength(DAY_COUNT);
    expect(total).toBe(DAY_COUNT * 2);
  });
});

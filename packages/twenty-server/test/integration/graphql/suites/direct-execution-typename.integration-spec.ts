import { randomUUID } from 'crypto';

import request from 'supertest';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FeatureFlagKey } from 'twenty-shared/types';

const FIND_MANY_COMPANIES_WITH_TYPENAME = `
  query Companies($filter: CompanyFilterInput, $orderBy: [CompanyOrderByInput]) {
    companies(filter: $filter, orderBy: $orderBy) {
      __typename
      edges {
        __typename
        node {
          __typename
          id
          name
          domainName {
            __typename
            primaryLinkLabel
            primaryLinkUrl
          }
        }
        cursor
      }
      pageInfo {
        __typename
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

describe('direct execution __typename filling (integration)', () => {
  const testCompanyId1 = randomUUID();
  const testCompanyId2 = randomUUID();

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_DIRECT_GRAPHQL_EXECUTION_ENABLED,
      value: false,
      expectToFail: false,
    });

    const gqlFields = 'id name';

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields,
        data: {
          id: testCompanyId1,
          name: 'TypeName Test Company A',
        },
      }),
    );

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields,
        data: {
          id: testCompanyId2,
          name: 'TypeName Test Company B',
        },
      }),
    );
  });

  afterAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_DIRECT_GRAPHQL_EXECUTION_ENABLED,
      value: false,
      expectToFail: false,
    });

    for (const id of [testCompanyId1, testCompanyId2]) {
      await makeGraphqlAPIRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'company',
          gqlFields: 'id',
          recordId: id,
        }),
      );
    }
  });

  it('should produce identical __typename values with and without direct execution', async () => {
    const client = request(`http://localhost:${APP_PORT}`);

    const variables = {
      filter: {
        id: { in: [testCompanyId1, testCompanyId2] },
      },
      orderBy: [{ name: 'AscNullsLast' }],
    };

    // Run through standard GraphQL Yoga schema execution
    const yogaResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({ query: FIND_MANY_COMPANIES_WITH_TYPENAME, variables })
      .expect(200);

    expect(yogaResponse.body.errors).toBeUndefined();
    expect(yogaResponse.body.data).toBeDefined();

    const yogaResult = yogaResponse.body.data.companies;

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_DIRECT_GRAPHQL_EXECUTION_ENABLED,
      value: true,
      expectToFail: false,
    });

    // Run through direct execution path
    const directResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({ query: FIND_MANY_COMPANIES_WITH_TYPENAME, variables })
      .expect(200);

    expect(directResponse.body.errors).toBeUndefined();
    expect(directResponse.body.data).toBeDefined();

    const directResult = directResponse.body.data.companies;

    expect(directResult).toStrictEqual(yogaResult);
  });
});

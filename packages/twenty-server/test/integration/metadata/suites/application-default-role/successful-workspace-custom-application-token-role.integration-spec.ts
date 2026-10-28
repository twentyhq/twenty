import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findWorkspaceCustomApplicationId } from 'test/integration/metadata/suites/application-default-role/utils/find-application-default-role.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const COMPANY_ID = randomUUID();

describe('The workspace custom application acts with its own default role', () => {
  let customApplicationToken: string;

  beforeAll(async () => {
    const { applicationAccessToken } = await generateApplicationTokenPair({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId: await findWorkspaceCustomApplicationId(),
    });

    customApplicationToken = applicationAccessToken.token;

    await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id',
        data: { id: COMPANY_ID, name: 'Custom application token role' },
      }),
    );
  });

  afterAll(async () => {
    await makeGraphqlApiRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id',
        recordId: COMPANY_ID,
      }),
    );
  });

  it('reads records with its own application token, as a workspace logic function does', async () => {
    const response = await makeGraphqlApiRequest(
      {
        query: gql`
          query Companies($filter: CompanyFilterInput) {
            companies(filter: $filter) {
              edges {
                node {
                  id
                }
              }
            }
          }
        `,
        variables: { filter: { id: { eq: COMPANY_ID } } },
      },
      customApplicationToken,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.companies.edges).toEqual([
      { node: { id: COMPANY_ID } },
    ]);
  });
});

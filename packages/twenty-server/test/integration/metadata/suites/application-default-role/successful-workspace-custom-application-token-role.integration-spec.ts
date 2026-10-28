import gql from 'graphql-tag';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { findWorkspaceCustomApplicationId } from 'test/integration/metadata/suites/application-default-role/utils/find-application-default-role.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

describe('The workspace custom application acts with its own default role', () => {
  let customApplicationToken: string;
  let companyId: string;

  beforeAll(async () => {
    const { applicationAccessToken } = await generateApplicationTokenPair({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId: await findWorkspaceCustomApplicationId(),
    });

    customApplicationToken = applicationAccessToken.token;

    // Other suites wipe every company, so the seeded ones may be gone by now
    const createCompanyResponse = await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'company',
        gqlFields: 'id',
        data: { name: 'Custom application token role company' },
      }),
    );

    companyId = createCompanyResponse.body.data.createCompany.id;
  });

  afterAll(async () => {
    await deleteRecordsByIds('company', [companyId]);
  });

  it('reads records with its own application token, as a workspace logic function does', async () => {
    const response = await makeGraphqlApiRequest(
      {
        query: gql`
          query Companies($companyId: UUID!) {
            companies(filter: { id: { eq: $companyId } }) {
              edges {
                node {
                  id
                }
              }
            }
          }
        `,
        variables: { companyId },
      },
      customApplicationToken,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.companies.edges).toEqual([
      { node: { id: companyId } },
    ]);
  });
});

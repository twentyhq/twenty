import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

// The seeded member role cannot update settings, so it lacks DATA_MODEL
describe('Object metadata read without DATA_MODEL should succeed', () => {
  let companyObjectMetadataId: string;

  beforeAll(async () => {
    companyObjectMetadataId = (
      await getCoreRepository<ObjectMetadataEntity>(
        ObjectMetadataEntity,
      ).findOneOrFail({
        where: {
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          nameSingular: 'company',
        },
      })
    ).id;
  });

  it('should read an object through GraphQL', async () => {
    const response = await makeMetadataApiRequest(
      {
        query: gql`
          query Object($id: UUID!) {
            object(id: $id) {
              id
              nameSingular
            }
          }
        `,
        variables: { id: companyObjectMetadataId },
      },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.object).toEqual({
      id: companyObjectMetadataId,
      nameSingular: 'company',
    });
  });

  it('should read an object through REST', async () => {
    const response = await makeRestApiRequest({
      method: 'get',
      path: `/metadata/objects/${companyObjectMetadataId}`,
      bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(response.status).toBe(200);
    expect(JSON.stringify(response.body)).toContain(companyObjectMetadataId);
  });
});

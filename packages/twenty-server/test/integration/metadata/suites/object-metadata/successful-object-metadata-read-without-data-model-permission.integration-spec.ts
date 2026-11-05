import gql from 'graphql-tag';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

// The seeded member role cannot update settings, so it lacks DATA_MODEL
describe('Object metadata read without DATA_MODEL should succeed', () => {
  let companyObjectMetadataId: string;

  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      input: { filter: {}, paging: { first: 1000 } },
      gqlFields: 'id nameSingular',
      expectToFail: false,
    });

    const companyObjectMetadata = objects.find(
      ({ nameSingular }) => nameSingular === 'company',
    );

    jestExpectToBeDefined(companyObjectMetadata);
    companyObjectMetadataId = companyObjectMetadata.id;
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

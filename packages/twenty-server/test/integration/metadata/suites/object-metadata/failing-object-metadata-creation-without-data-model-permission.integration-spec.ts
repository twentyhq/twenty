import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { expectOneNotInternalServerErrorHttpResponseSnapshot } from 'test/integration/utils/expect-one-not-internal-server-error-http-response-snapshot.util';

const createObjectInput = getMockCreateObjectInput({
  nameSingular: 'dataModelPermissionProbe',
  namePlural: 'dataModelPermissionProbes',
  labelSingular: 'Data model permission probe',
  labelPlural: 'Data model permission probes',
});

// The seeded member role cannot update settings, so it lacks DATA_MODEL
describe('Object metadata creation without DATA_MODEL should fail', () => {
  it('should refuse creating an object through GraphQL', async () => {
    const { errors } = await createOneObjectMetadata({
      input: createObjectInput,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('should refuse creating an object through REST', async () => {
    const response = await makeRestApiRequest({
      method: 'post',
      path: '/metadata/objects',
      bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      body: createObjectInput,
    });

    expectOneNotInternalServerErrorHttpResponseSnapshot(response);
  });
});

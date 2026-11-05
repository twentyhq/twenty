import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { expectOneNotInternalServerErrorHttpResponseSnapshot } from 'test/integration/utils/expect-one-not-internal-server-error-http-response-snapshot.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const createObjectInput = getMockCreateObjectInput({
  nameSingular: 'dataModelPermissionProbe',
  namePlural: 'dataModelPermissionProbes',
  labelSingular: 'Data model permission probe',
  labelPlural: 'Data model permission probes',
});

const countProbeObjects = () =>
  getCoreRepository<ObjectMetadataEntity>(ObjectMetadataEntity).count({
    where: {
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      nameSingular: createObjectInput.nameSingular,
    },
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
    expect(await countProbeObjects()).toBe(0);
  });

  it('should refuse creating an object through REST', async () => {
    const response = await makeRestApiRequest({
      method: 'post',
      path: '/metadata/objects',
      bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      body: createObjectInput,
    });

    expectOneNotInternalServerErrorHttpResponseSnapshot(response);
    expect(await countProbeObjects()).toBe(0);
  });
});

import gql from 'graphql-tag';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const createObjectInput = getMockCreateObjectInput({
  nameSingular: 'dataModelPermissionProbe',
  namePlural: 'dataModelPermissionProbes',
  labelSingular: 'Data model permission probe',
  labelPlural: 'Data model permission probes',
});

const countProbeObjects = async () =>
  getCoreRepository<ObjectMetadataEntity>(ObjectMetadataEntity).count({
    where: {
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      nameSingular: createObjectInput.nameSingular,
    },
  });

// The seeded member role cannot update settings, so it lacks DATA_MODEL
describe('object metadata for a member without DATA_MODEL (integration)', () => {
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

  it('should refuse creating an object through GraphQL', async () => {
    const { errors } = await createOneObjectMetadata({
      input: createObjectInput,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: true,
    });

    expect(errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
    expect(await countProbeObjects()).toBe(0);
  });

  it('should refuse creating an object through REST', async () => {
    const response = await makeRestApiRequest({
      method: 'post',
      path: '/metadata/objects',
      bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      body: createObjectInput,
    });

    expect(response.status).toBe(403);
    expect(await countProbeObjects()).toBe(0);
  });
});

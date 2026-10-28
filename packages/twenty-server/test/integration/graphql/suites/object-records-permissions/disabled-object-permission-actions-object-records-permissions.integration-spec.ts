import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlApiRequestWithApiKey } from 'test/integration/graphql/utils/make-graphql-api-request-with-api-key.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { PERSON_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/person-data-seeds.constant';

describe('disabled object permission actions', () => {
  let createRecordShareOperation: ReturnType<typeof createOneOperationFactory>;
  let recordShareObjectMetadataId: string;

  beforeAll(async () => {
    recordShareObjectMetadataId = (
      await getCoreRepository<ObjectMetadataEntity>(
        ObjectMetadataEntity,
      ).findOneOrFail({
        where: {
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          nameSingular: 'recordShare',
        },
      })
    ).id;

    const personObjectMetadata = await getCoreRepository<ObjectMetadataEntity>(
      ObjectMetadataEntity,
    ).findOneOrFail({
      where: { workspaceId: SEED_APPLE_WORKSPACE_ID, nameSingular: 'person' },
    });

    createRecordShareOperation = createOneOperationFactory({
      objectMetadataSingularName: 'recordShare',
      gqlFields: 'id',
      data: {
        recordId: PERSON_DATA_SEED_IDS.ID_1,
        objectMetadataId: personObjectMetadata.id,
        principalId: randomUUID(),
        principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
        accessLevel: RecordShareAccessLevel.READ,
        rowCause: RecordShareRowCause.MANUAL,
        sourceId: randomUUID(),
      },
    });
  });

  it.each([
    ['an admin API key', makeGraphqlApiRequestWithApiKey],
    ['an admin user', makeGraphqlApiRequest],
  ])('denies %s creating a record share', async (_, makeRequest) => {
    const response = await makeRequest(createRecordShareOperation);

    expect(response.body.data?.createRecordShare ?? null).toBeNull();
    expect(response.body.errors?.[0]?.extensions?.code).toBe(
      ErrorCode.FORBIDDEN,
    );
  });

  it("reports the actions disabled on record shares in an admin user's permissions", async () => {
    const response = await makeMetadataApiRequest({
      query: gql`
        query CurrentUserObjectsPermissions {
          currentUser {
            currentUserWorkspace {
              objectsPermissions {
                objectMetadataId
                canReadObjectRecords
                canUpdateObjectRecords
                canSoftDeleteObjectRecords
                canDestroyObjectRecords
              }
            }
          }
        }
      `,
    });

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.currentUser.currentUserWorkspace.objectsPermissions.find(
        ({ objectMetadataId }: { objectMetadataId: string }) =>
          objectMetadataId === recordShareObjectMetadataId,
      ),
    ).toEqual({
      objectMetadataId: recordShareObjectMetadataId,
      canReadObjectRecords: false,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    });
  });
});

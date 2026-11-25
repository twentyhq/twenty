import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlApiRequestWithApiKey } from 'test/integration/graphql/utils/make-graphql-api-request-with-api-key.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

describe('disabled object permission actions', () => {
  const createAgentTurnOperation = createOneOperationFactory({
    objectMetadataSingularName: 'agentTurn',
    gqlFields: 'id',
    data: { id: randomUUID() },
  });
  let agentTurnObjectMetadataId: string;

  beforeAll(async () => {
    agentTurnObjectMetadataId = (
      await getCoreRepository<ObjectMetadataEntity>(
        ObjectMetadataEntity,
      ).findOneOrFail({
        where: {
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          nameSingular: 'agentTurn',
        },
      })
    ).id;
  });

  it.each([
    ['an admin API key', makeGraphqlApiRequestWithApiKey],
    ['an admin user', makeGraphqlApiRequest],
  ])('denies %s creating an agent turn', async (_, makeRequest) => {
    const response = await makeRequest(createAgentTurnOperation);

    expect(response.body.data?.createAgentTurn ?? null).toBeNull();
    expect(response.body.errors?.[0]?.extensions?.code).toBe(
      ErrorCode.FORBIDDEN,
    );
  });

  it("reports the actions disabled on agent turns in an admin user's permissions", async () => {
    const response = await makeMetadataApiRequest({
      query: gql`
        query CurrentUserObjectRecordsPermissions {
          currentUser {
            currentUserWorkspace {
              objectRecordsPermissions {
                objectMetadataId
                canReadAllRecords
                canUpdateAllRecords
                canSoftDeleteAllRecords
                canDestroyAllRecords
                rowLevelRecordsPermissions {
                  canReadRecords
                  canUpdateRecords
                  canSoftDeleteRecords
                  canDestroyRecords
                }
              }
            }
          }
        }
      `,
    });

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.currentUser.currentUserWorkspace.objectRecordsPermissions.find(
        ({ objectMetadataId }: { objectMetadataId: string }) =>
          objectMetadataId === agentTurnObjectMetadataId,
      ),
    ).toEqual({
      objectMetadataId: agentTurnObjectMetadataId,
      canReadAllRecords: false,
      canUpdateAllRecords: false,
      canSoftDeleteAllRecords: false,
      canDestroyAllRecords: false,
      rowLevelRecordsPermissions: null,
    });
  });
});

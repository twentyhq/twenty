import { randomUUID } from 'node:crypto';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { type RecordShareInput } from 'src/engine/record-share/types/record-share-input.type';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { PERSON_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/person-data-seeds.constant';

describe('recordShare object', () => {
  let recordShareService: RecordShareService;
  let personObjectMetadataId: string;
  let recordShareInput: RecordShareInput;

  const sourceId = randomUUID();

  beforeAll(async () => {
    recordShareService =
      getAppProviderByClassName<RecordShareService>('RecordShareService');

    const personObjectMetadata = await getCoreRepository<ObjectMetadataEntity>(
      ObjectMetadataEntity,
    ).findOneOrFail({
      where: {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        nameSingular: 'person',
      },
    });

    personObjectMetadataId = personObjectMetadata.id;

    recordShareInput = {
      recordId: PERSON_DATA_SEED_IDS.ID_1,
      objectMetadataId: personObjectMetadataId,
      principalId: randomUUID(),
      principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
      accessLevel: RecordShareAccessLevel.READ,
      rowCause: RecordShareRowCause.MANUAL,
      sourceId,
    };
  });

  afterAll(async () => {
    await recordShareService.deleteBySourceId({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      sourceId,
    });
  });

  it('refuses creation through the GraphQL API even for an admin', async () => {
    const response = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'recordShare',
        gqlFields: 'id',
        data: recordShareInput,
      }),
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('not writable');
  });

  it('inserts, reads back, deduplicates and removes shares through the service', async () => {
    await recordShareService.insertMany({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      recordShares: [recordShareInput],
    });

    const insertedRecordShares = await recordShareService.findByRecord({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      objectMetadataId: personObjectMetadataId,
      recordId: PERSON_DATA_SEED_IDS.ID_1,
    });

    expect(insertedRecordShares).toHaveLength(1);
    expect(insertedRecordShares[0]).toMatchObject(recordShareInput);

    await recordShareService.insertMany({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      recordShares: [
        { ...recordShareInput, accessLevel: RecordShareAccessLevel.FULL },
      ],
    });

    const recordSharesAfterDuplicateInsert =
      await recordShareService.findByRecord({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        objectMetadataId: personObjectMetadataId,
        recordId: PERSON_DATA_SEED_IDS.ID_1,
      });

    expect(recordSharesAfterDuplicateInsert).toHaveLength(1);
    expect(recordSharesAfterDuplicateInsert[0].accessLevel).toBe(
      RecordShareAccessLevel.READ,
    );

    await recordShareService.deleteBySourceId({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      sourceId,
    });

    const recordSharesAfterDelete = await recordShareService.findByRecord({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      objectMetadataId: personObjectMetadataId,
      recordId: PERSON_DATA_SEED_IDS.ID_1,
    });

    expect(recordSharesAfterDelete).toHaveLength(0);
  });
});

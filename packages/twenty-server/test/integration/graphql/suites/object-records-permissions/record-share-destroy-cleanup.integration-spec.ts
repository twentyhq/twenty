import { randomUUID } from 'node:crypto';

import { parse } from 'graphql';
import {
  FeatureFlagKey,
  FieldMetadataType,
  RecordShareAccessLevel,
} from 'twenty-shared/types';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { restoreOneOperationFactory } from 'test/integration/graphql/utils/restore-one-operation-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const OBJECT_NAME = 'destroyedSharingRecord';
const OBJECT_PLURAL = 'destroyedSharingRecords';
const workspaceId = SEED_APPLE_WORKSPACE_ID;
const SET_SHARE = parse(
  `mutation SetShare($target: RecordSharingTargetInput!, $principal: RecordSharePrincipalInput!, $enabled: Boolean!) { setRecordShare(target: $target, principal: $principal, enabled: $enabled) { generalAccessLevel } }`,
);

describe('Record shares of destroyed records', () => {
  let objectMetadataId: string;
  let shares: RecordShareStorageService;
  const createdRecordIds: string[] = [];

  const setRecordSharingEnabled = (value: boolean) =>
    updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
      value,
      expectToFail: false,
    });

  const createRecord = async (
    recordId: string,
    token = APPLE_JANE_ADMIN_ACCESS_TOKEN,
  ) => {
    const response = await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: OBJECT_NAME,
        gqlFields: 'id',
        data: { id: recordId, name: 'Shared record' },
      }),
      token,
    );

    expect(response.body.errors).toBeUndefined();
    createdRecordIds.push(recordId);
  };

  const restrictToOwner = async (recordId: string) => {
    const response = await makeMetadataApiRequest(
      {
        query: SET_SHARE,
        variables: {
          target: { objectMetadataId, recordId },
          principal: { everyone: true },
          enabled: false,
        },
      },
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

    expect(response.body.data.setRecordShare.generalAccessLevel).toBe(
      RecordShareAccessLevel.NONE,
    );
  };

  const findShares = (recordIds: string[]) =>
    shares.findByRecordIds({ workspaceId, objectMetadataId, recordIds });

  const findRecordIds = async (recordId: string, token: string) => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: OBJECT_NAME,
        objectMetadataPluralName: OBJECT_PLURAL,
        gqlFields: 'id',
        filter: { id: { eq: recordId } },
      }),
      token,
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data[OBJECT_PLURAL].edges.map(
      ({ node }: { node: { id: string } }) => node.id,
    );
  };

  beforeAll(async () => {
    shares = getAppProviderByClassName<RecordShareStorageService>(
      'RecordShareStorageService',
    );
    const { data } = await createOneObjectMetadata({
      input: {
        nameSingular: OBJECT_NAME,
        namePlural: OBJECT_PLURAL,
        labelSingular: 'Destroyed sharing record',
        labelPlural: 'Destroyed sharing records',
        icon: 'IconShare',
        isLabelSyncedWithName: false,
      },
    });

    objectMetadataId = data.createOneObject.id;
    await createOneFieldMetadata({
      input: {
        name: 'name',
        label: 'Name',
        type: FieldMetadataType.TEXT,
        objectMetadataId,
        isLabelSyncedWithName: false,
      },
    });
    await setRecordSharingEnabled(true);
  });

  afterAll(async () => {
    await setRecordSharingEnabled(false);
    await makeGraphqlApiRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: OBJECT_NAME,
        objectMetadataPluralName: OBJECT_PLURAL,
        gqlFields: 'id',
        filter: { id: { in: createdRecordIds } },
      }),
    );
    await shares.deleteByRecordIds({
      workspaceId,
      objectMetadataId,
      recordIds: createdRecordIds,
    });
    await updateOneObjectMetadata({
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { isActive: false },
      },
      expectToFail: false,
    });
    await deleteOneObjectMetadata({ input: { idToDelete: objectMetadataId } });
  });

  it('should delete the share rows of a record destroyed by id', async () => {
    const recordId = randomUUID();

    await createRecord(recordId);
    await restrictToOwner(recordId);

    expect(await findShares([recordId])).not.toEqual([]);

    const destroyed = await makeGraphqlApiRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: OBJECT_NAME,
        gqlFields: 'id',
        recordId,
      }),
    );

    expect(destroyed.body.errors).toBeUndefined();
    expect(await findShares([recordId])).toEqual([]);
  });

  it('should delete the share rows of every record destroyed in bulk', async () => {
    const recordIds = [randomUUID(), randomUUID()];

    for (const recordId of recordIds) {
      await createRecord(recordId);
      await restrictToOwner(recordId);
    }

    expect(await findShares(recordIds)).not.toEqual([]);

    const destroyed = await makeGraphqlApiRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: OBJECT_NAME,
        objectMetadataPluralName: OBJECT_PLURAL,
        gqlFields: 'id',
        filter: { id: { in: recordIds } },
      }),
    );

    expect(destroyed.body.errors).toBeUndefined();
    expect(await findShares(recordIds)).toEqual([]);
  });

  it('should not restrict a record created with the id of a destroyed one', async () => {
    const recordId = randomUUID();

    await createRecord(recordId);
    await restrictToOwner(recordId);
    await makeGraphqlApiRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: OBJECT_NAME,
        gqlFields: 'id',
        recordId,
      }),
    );

    await createRecord(recordId, APPLE_JONY_MEMBER_ACCESS_TOKEN);

    expect(await findShares([recordId])).toEqual([]);
    expect(
      await findRecordIds(recordId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toEqual([recordId]);
  });

  it('should keep the share rows of a soft deleted record', async () => {
    const recordId = randomUUID();

    await createRecord(recordId);
    await restrictToOwner(recordId);

    const sharesBeforeDeletion = await findShares([recordId]);

    await makeGraphqlApiRequest(
      deleteOneOperationFactory({
        objectMetadataSingularName: OBJECT_NAME,
        gqlFields: 'id',
        recordId,
      }),
    );
    await makeGraphqlApiRequest(
      restoreOneOperationFactory({
        objectMetadataSingularName: OBJECT_NAME,
        gqlFields: 'id',
        recordId,
      }),
    );

    expect(await findShares([recordId])).toHaveLength(
      sharesBeforeDeletion.length,
    );
    expect(
      await findRecordIds(recordId, APPLE_JONY_MEMBER_ACCESS_TOKEN),
    ).toEqual([]);
  });
});

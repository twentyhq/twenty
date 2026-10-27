import { randomUUID } from 'node:crypto';

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, MetadataReadability } from 'twenty-shared/types';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { preserveLegacyRecordAccess } from 'src/database/commands/upgrade-version-command/2-43/utils/preserve-legacy-record-access.util';
import { type RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const OBJECT_NAME = 'sharingPolicyRecord';
const OBJECT_PLURAL = 'sharingPolicyRecords';
const RECORD_ID = randomUUID();
const workspaceId = SEED_APPLE_WORKSPACE_ID;

describe('Legacy record access preservation', () => {
  let objectMetadataId: string;
  let shares: RecordShareStorageService;

  beforeAll(async () => {
    shares = getAppProviderByClassName<RecordShareStorageService>(
      'RecordShareStorageService',
    );
    const { data } = await createOneObjectMetadata({
      input: {
        nameSingular: OBJECT_NAME,
        namePlural: OBJECT_PLURAL,
        labelSingular: 'Sharing policy record',
        labelPlural: 'Sharing policy records',
        icon: 'IconLock',
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
    expect(
      (
        await makeGraphqlApiRequest(
          createOneOperationFactory({
            objectMetadataSingularName: OBJECT_NAME,
            gqlFields: 'id',
            data: { id: RECORD_ID, name: 'Private' },
          }),
        )
      ).body.errors,
    ).toBeUndefined();
  });

  afterAll(async () => {
    await shares.deleteByRecordIds({
      workspaceId,
      objectMetadataId,
      recordIds: [RECORD_ID],
    });
    await makeGraphqlApiRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: OBJECT_NAME,
        objectMetadataPluralName: OBJECT_PLURAL,
        gqlFields: 'id',
        filter: { id: { eq: RECORD_ID } },
      }),
    );
    await updateOneObjectMetadata({
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { isActive: false },
      },
      expectToFail: false,
    });
    await deleteOneObjectMetadata({ input: { idToDelete: objectMetadataId } });
  });

  it('preserves legacy access once without sharing records created after the migration', async () => {
    const cache = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
    const { flatObjectMetadataMaps } = await cache.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
    ]);
    const objects = Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
      .filter(
        (object) =>
          object?.id === objectMetadataId ||
          object?.universalIdentifier ===
            STANDARD_OBJECTS.agentChatThread.universalIdentifier,
      )
      .map((object) => ({
        ...object!,
        readability:
          object!.id === objectMetadataId
            ? MetadataReadability.PRIVATE
            : MetadataReadability.SYSTEM,
      }));
    const object = objects.find((item) => item.id === objectMetadataId)!;
    const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
    const runner = global.testDataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      await runner.query(
        `DELETE FROM core."keyValuePair" WHERE "workspaceId" = $1 AND "key" = 'COMMON_RECORD_SHARING_LEGACY_ACCESS_MIGRATED'`,
        [workspaceId],
      );
      const migration = () =>
        preserveLegacyRecordAccess({
          manager: runner.manager,
          workspaceId,
          objects,
          wasRecordSharingEnabled: false,
        });
      const threadObject = objects.find(
        (item) =>
          item.universalIdentifier ===
          STANDARD_OBJECTS.agentChatThread.universalIdentifier,
      )!;
      const threadGrantsBefore = await runner.query(
        `SELECT id FROM ${schema}."recordShare" WHERE "objectMetadataId" = $1 AND "principalId" = $2 ORDER BY id`,
        [threadObject.id, EVERYONE_PRINCIPAL_ID],
      );
      await migration();
      expect(
        await runner.query(
          `SELECT id FROM ${schema}."recordShare" WHERE "objectMetadataId" = $1 AND "principalId" = $2 ORDER BY id`,
          [threadObject.id, EVERYONE_PRINCIPAL_ID],
        ),
      ).toEqual(threadGrantsBefore);
      const grants = await runner.query(
        `SELECT "accessLevel", "rowCause" FROM ${schema}."recordShare" WHERE "objectMetadataId" = $1 AND "recordId" = $2 AND "principalId" = $3`,
        [objectMetadataId, RECORD_ID, EVERYONE_PRINCIPAL_ID],
      );
      expect(grants).toEqual([
        { accessLevel: 'FULL', rowCause: 'APPLICATION' },
      ]);
      const newId = randomUUID();
      await runner.query(
        `INSERT INTO ${schema}.${escapeIdentifier(computeObjectTargetTable(object))} (id, "createdByName", "createdBySource", "updatedByName", "updatedBySource") SELECT $1, "createdByName", "createdBySource", "updatedByName", "updatedBySource" FROM ${schema}.${escapeIdentifier(computeObjectTargetTable(object))} record WHERE id = $2`,
        [newId, RECORD_ID],
      );
      await migration();
      expect(
        await runner.query(
          `SELECT id FROM ${schema}."recordShare" WHERE "recordId" = $1`,
          [newId],
        ),
      ).toEqual([]);
    } finally {
      await runner.rollbackTransaction();
      await runner.release();
    }
  });
});

import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const SCHEMA_NAME = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
const TABLE_NAME = '_softDeleteRetentionTest';
const COLUMN_NAME = 'retainedField';
const RETAIN_MARKER = 'softdelete-retain-marker';

let objectMetadataId = '';

const columnExists = async (): Promise<boolean> => {
  const rows = await globalThis.testDataSource.query(
    `SELECT 1 FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 AND column_name = $3`,
    [SCHEMA_NAME, TABLE_NAME, COLUMN_NAME],
  );

  return rows.length > 0;
};

const columnComment = async (): Promise<string | null> => {
  const rows = await globalThis.testDataSource.query(
    `SELECT pg_catalog.col_description(c.oid, a.attnum) AS comment
     FROM pg_class c
     JOIN pg_namespace n ON n.oid = c.relnamespace
     JOIN pg_attribute a ON a.attrelid = c.oid
     WHERE n.nspname = $1 AND c.relname = $2 AND a.attname = $3`,
    [SCHEMA_NAME, TABLE_NAME, COLUMN_NAME],
  );

  return rows[0]?.comment ?? null;
};

const pendingDropCount = async (): Promise<number> => {
  const rows = await globalThis.testDataSource.query(
    `SELECT id FROM core."pendingMetadataDrop" WHERE "workspaceId" = $1 AND "tableName" = $2 AND "kind" = 'COLUMN' AND "columnNames" @> $3::jsonb`,
    [SEED_APPLE_WORKSPACE_ID, TABLE_NAME, JSON.stringify([COLUMN_NAME])],
  );

  return rows.length;
};

const createRetainedField = async (): Promise<string> => {
  const { data } = await createOneFieldMetadata({
    input: {
      name: COLUMN_NAME,
      label: 'Retained Field',
      type: FieldMetadataType.TEXT,
      objectMetadataId,
      isLabelSyncedWithName: false,
    },
    gqlFields: 'id name',
  });

  return data.createOneField.id;
};

const deactivateAndDeleteField = async (fieldId: string): Promise<void> => {
  await updateOneFieldMetadata({
    expectToFail: false,
    input: { idToUpdate: fieldId, updatePayload: { isActive: false } },
  });

  await deleteOneFieldMetadata({
    expectToFail: false,
    input: { idToDelete: fieldId },
  });
};

describe('Metadata removal retention — deferred drop and reclaim', () => {
  beforeAll(async () => {
    await updateConfigVariable({
      input: { key: 'METADATA_REMOVAL_RETENTION_DAYS', value: 7 },
    });

    const { data } = await createOneObjectMetadata({
      input: {
        nameSingular: 'softDeleteRetentionTest',
        namePlural: 'softDeleteRetentionTests',
        labelSingular: 'Soft Delete Retention Test',
        labelPlural: 'Soft Delete Retention Tests',
        icon: 'IconTrash',
      },
    });

    objectMetadataId = data.createOneObject.id;
  }, 90000);

  afterAll(async () => {
    await updateConfigVariable({
      input: { key: 'METADATA_REMOVAL_RETENTION_DAYS', value: 0 },
    });

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { isActive: false },
      },
    });

    await deleteOneObjectMetadata({
      input: { idToDelete: objectMetadataId },
    });

    await globalThis.testDataSource.query(
      `DELETE FROM core."pendingMetadataDrop" WHERE "workspaceId" = $1 AND "tableName" = $2`,
      [SEED_APPLE_WORKSPACE_ID, TABLE_NAME],
    );
  }, 90000);

  it('retains a removed column for the retention window, then reclaims it with data intact on re-add', async () => {
    const fieldId = await createRetainedField();

    expect(await columnExists()).toBe(true);

    await globalThis.testDataSource.query(
      `COMMENT ON COLUMN "${SCHEMA_NAME}"."${TABLE_NAME}"."${COLUMN_NAME}" IS '${RETAIN_MARKER}'`,
    );

    expect(await columnComment()).toBe(RETAIN_MARKER);

    await deactivateAndDeleteField(fieldId);

    expect(await columnExists()).toBe(true);
    expect(await columnComment()).toBe(RETAIN_MARKER);
    expect(await pendingDropCount()).toBe(1);

    await createRetainedField();

    expect(await columnExists()).toBe(true);
    expect(await columnComment()).toBe(RETAIN_MARKER);
    expect(await pendingDropCount()).toBe(0);
  }, 90000);
});

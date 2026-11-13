import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import {
  type FieldMetadataComplexOption,
  FieldMetadataType,
} from 'twenty-shared/types';

import { type AlignFieldMetadataOptionRowsWithStoredOptionsCommand } from 'src/database/commands/upgrade-version-command/2-59/2-59-workspace-command-1794522024289-align-field-metadata-option-rows-with-stored-options.command';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

type StoredOption = FieldMetadataComplexOption & { id: string };

const findOptionRows = async (fieldMetadataId: string) =>
  globalThis.testDataSource.query(
    `SELECT "universalIdentifier" AS id, value, label, color, position
      FROM core."fieldMetadataOption" WHERE "fieldMetadataId" = $1 ORDER BY position`,
    [fieldMetadataId],
  );

describe('2-59 workspace command - align field metadata option rows with stored options (integration)', () => {
  let objectMetadataId: string;
  let fieldMetadataId: string;
  let options: StoredOption[];

  beforeAll(async () => {
    const { data: objectData } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'optionRowsAlignment',
        namePlural: 'optionRowsAlignments',
        labelSingular: 'Option Rows Alignment',
        labelPlural: 'Option Rows Alignments',
        icon: 'IconTestPipe',
        isLabelSyncedWithName: false,
      },
    });

    objectMetadataId = objectData.createOneObject.id;

    const { data: fieldData } = await createOneFieldMetadata<
      FieldMetadataType.SELECT,
      { id: string; options: StoredOption[] }
    >({
      expectToFail: false,
      input: {
        objectMetadataId,
        type: FieldMetadataType.SELECT,
        name: 'status',
        label: 'Status',
        isLabelSyncedWithName: false,
        options: [
          { label: 'Open', value: 'OPEN', color: 'green', position: 0 },
          { label: 'Closed', value: 'CLOSED', color: 'red', position: 1 },
        ],
      },
      gqlFields: 'id options',
    });

    fieldMetadataId = fieldData.createOneField.id;
    options = fieldData.createOneField.options;
  });

  afterAll(async () => {
    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: fieldMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneFieldMetadata({
      expectToFail: false,
      input: { idToDelete: fieldMetadataId },
    });
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: objectMetadataId },
    });
  });

  it('inserts the missing row, updates the different one and deletes the unknown one', async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM core."fieldMetadataOption"
        WHERE "fieldMetadataId" = $1 AND value = 'CLOSED'`,
      [fieldMetadataId],
    );
    await globalThis.testDataSource.query(
      `UPDATE core."fieldMetadataOption" SET label = 'Stale'
        WHERE "fieldMetadataId" = $1 AND value = 'OPEN'`,
      [fieldMetadataId],
    );
    await globalThis.testDataSource.query(
      `INSERT INTO core."fieldMetadataOption"
          ("workspaceId", "universalIdentifier", "fieldMetadataId", "applicationId", value, label, color, position)
        SELECT "workspaceId", gen_random_uuid(), id, "applicationId", 'UNKNOWN', 'Unknown', 'gray', 2
        FROM core."fieldMetadata" WHERE id = $1`,
      [fieldMetadataId],
    );

    await getAppProviderByClassName<AlignFieldMetadataOptionRowsWithStoredOptionsCommand>(
      'AlignFieldMetadataOptionRowsWithStoredOptionsCommand',
    ).runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options: {},
      index: 0,
      total: 1,
    });

    expect(await findOptionRows(fieldMetadataId)).toEqual(options);
  });
});

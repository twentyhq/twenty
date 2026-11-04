import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

type StoredOption = {
  id: string;
  value: string;
  label: string;
  color: string;
  position: number;
};

type OptionRow = {
  universalIdentifier: string;
  applicationId: string;
  value: string;
  label: string;
  color: string | null;
  position: number;
  isActive: boolean;
  overrides: object | null;
};

const findOptionRows = async (fieldMetadataId: string): Promise<OptionRow[]> =>
  globalThis.testDataSource.query(
    `SELECT "universalIdentifier", "applicationId", value, label, color, position, "isActive", overrides
      FROM core."fieldMetadataOption" WHERE "fieldMetadataId" = $1 ORDER BY position`,
    [fieldMetadataId],
  );

const findFieldApplicationId = async (
  fieldMetadataId: string,
): Promise<string> => {
  const [{ applicationId }] = await globalThis.testDataSource.query(
    `SELECT "applicationId" FROM core."fieldMetadata" WHERE id = $1`,
    [fieldMetadataId],
  );

  return applicationId;
};

const toExpectedRows = (options: StoredOption[], applicationId: string) =>
  [...options]
    .sort((first, second) => first.position - second.position)
    .map(({ id, value, label, color, position }) => ({
      universalIdentifier: id,
      applicationId,
      value,
      label,
      color,
      position,
      isActive: true,
      overrides: null,
    }));

describe('field metadata option rows follow field options', () => {
  let objectMetadataId: string;

  beforeAll(async () => {
    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'optionRowsSync',
        namePlural: 'optionRowsSyncs',
        labelSingular: 'Option Rows Sync',
        labelPlural: 'Option Rows Syncs',
        icon: 'IconTestPipe',
        isLabelSyncedWithName: false,
      },
    });

    objectMetadataId = data.createOneObject.id;
  });

  afterAll(async () => {
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

  it('creates, updates and deletes option rows with the field', async () => {
    const { data: createData } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        objectMetadataId,
        type: FieldMetadataType.SELECT,
        name: 'stageField',
        label: 'Stage Field',
        isLabelSyncedWithName: false,
        options: [
          { label: 'New', value: 'NEW', color: 'green', position: 0 },
          { label: 'Won', value: 'WON', color: 'blue', position: 1 },
          { label: 'Lost', value: 'LOST', color: 'red', position: 2 },
        ],
      },
      gqlFields: 'id options',
    });

    const fieldMetadataId: string = createData.createOneField.id;
    const createdOptions: StoredOption[] = createData.createOneField.options;
    const applicationId = await findFieldApplicationId(fieldMetadataId);

    expect(await findOptionRows(fieldMetadataId)).toEqual(
      toExpectedRows(createdOptions, applicationId),
    );

    const [newOption, wonOption] = createdOptions;

    const { data: updateData } = await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: fieldMetadataId,
        updatePayload: {
          options: [
            { ...wonOption, label: 'Closed won', position: 0 },
            { ...newOption, position: 1 },
            { label: 'Paused', value: 'PAUSED', color: 'gray', position: 2 },
          ],
        },
      },
      gqlFields: 'id options',
    });

    const updatedOptions: StoredOption[] = updateData.updateOneField.options;

    expect(await findOptionRows(fieldMetadataId)).toEqual(
      toExpectedRows(updatedOptions, applicationId),
    );

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

    expect(await findOptionRows(fieldMetadataId)).toEqual([]);
  });

  it('keeps a row for every option of the standard fields', async () => {
    const [{ missingOptionRowCount }] = await globalThis.testDataSource.query(
      `SELECT count(*)::int AS "missingOptionRowCount"
        FROM core."fieldMetadata" field
        CROSS JOIN LATERAL jsonb_array_elements(field.options::jsonb) option
        LEFT JOIN core."fieldMetadataOption" row
          ON row."fieldMetadataId" = field.id AND row."universalIdentifier"::text = option->>'id'
        WHERE field."workspaceId" = $1
          AND field.type IN ('SELECT', 'MULTI_SELECT', 'RATING')
          AND (row.id IS NULL OR row.value <> option->>'value' OR row."applicationId" <> field."applicationId")`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    expect(missingOptionRowCount).toBe(0);
  });
});

import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
const TABLE_NAME = '_richTextColumnTestObject';

const findRichTextColumns = async (
  fieldName: string,
): Promise<{ columnName: string; dataType: string }[]> =>
  global.testDataSource.query(
    `SELECT column_name AS "columnName", data_type AS "dataType"
     FROM information_schema.columns
     WHERE table_schema = $1 AND table_name = $2 AND column_name LIKE $3
     ORDER BY column_name`,
    [SCHEMA, TABLE_NAME, `${fieldName}%`],
  );

describe('Rich text field fileIds column lifecycle', () => {
  let objectMetadataId = '';
  let fieldMetadataId = '';

  beforeAll(async () => {
    const {
      data: { createOneObject },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'richTextColumnTestObject',
        namePlural: 'richTextColumnTestObjects',
        labelSingular: 'Rich Text Column Test Object',
        labelPlural: 'Rich Text Column Test Objects',
        icon: 'IconFile',
      },
    });

    objectMetadataId = createOneObject.id;
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
      input: { idToDelete: objectMetadataId },
    });
  });

  it('should create the fileIds column with a rich text field', async () => {
    const {
      data: { createOneField },
    } = await createOneFieldMetadata({
      input: {
        name: 'summary',
        label: 'Summary',
        type: FieldMetadataType.RICH_TEXT,
        objectMetadataId,
      },
      gqlFields: 'id',
    });

    fieldMetadataId = createOneField.id;

    expect(await findRichTextColumns('summary')).toEqual([
      { columnName: 'summaryBlocknote', dataType: 'text' },
      { columnName: 'summaryFileIds', dataType: 'jsonb' },
      { columnName: 'summaryMarkdown', dataType: 'text' },
      { columnName: 'summaryTiptap', dataType: 'text' },
    ]);
  });

  it('should refuse a field whose name is the fileIds column of a rich text field', async () => {
    const { errors } = await createOneFieldMetadata({
      expectToFail: true,
      input: {
        name: 'summaryFileIds',
        label: 'Summary file ids',
        type: FieldMetadataType.TEXT,
        objectMetadataId,
      },
      gqlFields: 'id',
    });

    expect(errors).toBeDefined();
  });

  it('should rename a field whose fileIds column was not provisioned yet', async () => {
    await global.testDataSource.query(
      `ALTER TABLE "${SCHEMA}"."${TABLE_NAME}" DROP COLUMN "summaryFileIds"`,
    );

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: fieldMetadataId,
        updatePayload: { name: 'outline', label: 'Outline' },
      },
      gqlFields: 'id',
    });

    expect(
      (await findRichTextColumns('outline')).map(
        ({ columnName }) => columnName,
      ),
    ).toEqual([
      'outlineBlocknote',
      'outlineFileIds',
      'outlineMarkdown',
      'outlineTiptap',
    ]);
  });

  it('should rename the fileIds column with the field', async () => {
    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: fieldMetadataId,
        updatePayload: { name: 'recap', label: 'Recap' },
      },
      gqlFields: 'id',
    });

    expect(await findRichTextColumns('outline')).toEqual([]);
    expect(
      (await findRichTextColumns('recap')).map(({ columnName }) => columnName),
    ).toEqual([
      'recapBlocknote',
      'recapFileIds',
      'recapMarkdown',
      'recapTiptap',
    ]);
  });

  it('should drop the fileIds column with the field', async () => {
    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: fieldMetadataId,
        updatePayload: { isActive: false },
      },
      gqlFields: 'id',
    });
    await deleteOneFieldMetadata({
      expectToFail: false,
      input: { idToDelete: fieldMetadataId },
    });

    expect(await findRichTextColumns('recap')).toEqual([]);
  });
});

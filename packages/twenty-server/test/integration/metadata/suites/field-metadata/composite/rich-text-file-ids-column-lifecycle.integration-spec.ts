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

const findColumns = async (
  columnNamePrefix: string,
): Promise<{ columnName: string; dataType: string }[]> => {
  const columns: { columnName: string; dataType: string }[] =
    await global.testDataSource.query(
      `SELECT column_name AS "columnName", data_type AS "dataType"
       FROM information_schema.columns
       WHERE table_schema = $1 AND table_name = $2 AND column_name LIKE $3`,
      [SCHEMA, TABLE_NAME, `${columnNamePrefix}%`],
    );

  return columns.sort((columnA, columnB) =>
    columnA.columnName < columnB.columnName ? -1 : 1,
  );
};

const findColumnNames = async (columnNamePrefix: string): Promise<string[]> =>
  (await findColumns(columnNamePrefix)).map(({ columnName }) => columnName);

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

    expect(await findColumns('summary')).toEqual([
      { columnName: 'summaryBlocknote', dataType: 'text' },
      { columnName: 'summaryMarkdown', dataType: 'text' },
      { columnName: 'summaryTiptap', dataType: 'text' },
      { columnName: 'summary_fileIds', dataType: 'jsonb' },
    ]);
  });

  it('should accept a field named after the rich text field, whose column the fileIds column cannot shadow', async () => {
    await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'summaryFileIds',
        label: 'Summary file ids',
        type: FieldMetadataType.TEXT,
        objectMetadataId,
      },
      gqlFields: 'id',
    });

    expect(await findColumnNames('summary')).toEqual([
      'summaryBlocknote',
      'summaryFileIds',
      'summaryMarkdown',
      'summaryTiptap',
      'summary_fileIds',
    ]);
  });

  it('should rename a field whose fileIds column was not provisioned yet', async () => {
    await global.testDataSource.query(
      `ALTER TABLE "${SCHEMA}"."${TABLE_NAME}" DROP COLUMN "summary_fileIds"`,
    );

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: fieldMetadataId,
        updatePayload: { name: 'outline', label: 'Outline' },
      },
      gqlFields: 'id',
    });

    expect(await findColumnNames('outline')).toEqual([
      'outlineBlocknote',
      'outlineMarkdown',
      'outlineTiptap',
      'outline_fileIds',
    ]);
    expect(await findColumnNames('summary')).toEqual(['summaryFileIds']);
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

    expect(await findColumnNames('outline')).toEqual([]);
    expect(await findColumnNames('recap')).toEqual([
      'recapBlocknote',
      'recapMarkdown',
      'recapTiptap',
      'recap_fileIds',
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

    expect(await findColumnNames('recap')).toEqual([]);
    expect(await findColumnNames('summary')).toEqual(['summaryFileIds']);
  });
});

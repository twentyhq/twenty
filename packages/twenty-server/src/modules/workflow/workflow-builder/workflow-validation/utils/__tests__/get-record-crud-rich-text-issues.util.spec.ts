import { FieldMetadataType } from 'twenty-shared/types';

import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.workspace-service';
import { getRecordCrudRichTextIssues } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-record-crud-rich-text-issues.util';

type TestField = { id: string; name: string; type: FieldMetadataType };

const buildObjectMetadataInfo = (
  fields: TestField[],
): Pick<
  ObjectMetadataInfo,
  'flatObjectMetadata' | 'flatFieldMetadataMaps'
> => ({
  flatObjectMetadata: getFlatObjectMetadataMock({
    universalIdentifier: 'object-universal-id',
    fieldIds: fields.map((field) => field.id),
  }),
  flatFieldMetadataMaps: addAllFlatEntitiesToFlatEntityMaps({
    flatEntities: fields.map((field) =>
      getFlatFieldMetadataMock({
        ...field,
        universalIdentifier: field.id,
        objectMetadataId: 'object-id',
      }),
    ),
    flatEntityMaps: createEmptyFlatEntityMaps(),
  }),
});

const objectMetadataInfo = buildObjectMetadataInfo([
  { id: 'field-1', name: 'body', type: FieldMetadataType.RICH_TEXT },
  { id: 'field-2', name: 'title', type: FieldMetadataType.TEXT },
]);

const getIssues = (objectRecord: Record<string, unknown>) =>
  getRecordCrudRichTextIssues({
    objectRecord,
    objectMetadataInfo,
    stepLabel: 'Create task',
    stepId: 'step-1',
  });

describe('getRecordCrudRichTextIssues', () => {
  it('flags a bare-string rich text value', () => {
    const issues = getIssues({ body: 'Hello {{name}}' });

    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      severity: 'error',
      code: 'INVALID_RICH_TEXT_FIELD',
      stepId: 'step-1',
    });
  });

  it('flags arrays and malformed objects', () => {
    expect(getIssues({ body: ['x'] })).toHaveLength(1);
    expect(getIssues({ body: { blocknote: 123 } })).toHaveLength(1);
    expect(getIssues({ body: { unexpectedKey: 'x' } })).toHaveLength(1);
  });

  it('accepts valid rich text values and ignores non-rich-text fields', () => {
    expect(getIssues({ body: { blocknote: '[]', markdown: null } })).toEqual(
      [],
    );
    expect(getIssues({ body: { markdown: 'text' } })).toEqual([]);
    expect(getIssues({ body: null })).toEqual([]);
    expect(getIssues({ title: 'a plain string' })).toEqual([]);
  });
});

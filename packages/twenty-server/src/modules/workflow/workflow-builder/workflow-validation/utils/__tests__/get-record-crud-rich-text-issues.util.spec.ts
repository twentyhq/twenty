import { FieldMetadataType } from 'twenty-shared/types';

import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.workspace-service';
import { getRecordCrudRichTextIssues } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-record-crud-rich-text-issues.util';

type TestField = { id: string; name: string; type: FieldMetadataType };

const buildObjectMetadataInfo = (fields: TestField[]): ObjectMetadataInfo => {
  const byUniversalIdentifier = Object.fromEntries(
    fields.map((field) => [field.id, field]),
  );
  const universalIdentifierById = Object.fromEntries(
    fields.map((field) => [field.id, field.id]),
  );

  return {
    flatObjectMetadata: { fieldIds: fields.map((field) => field.id) },
    flatFieldMetadataMaps: { byUniversalIdentifier, universalIdentifierById },
  } as unknown as ObjectMetadataInfo;
};

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
    expect(getIssues({ body: { blocknote: '[]', markdown: null } })).toEqual([]);
    expect(getIssues({ body: { markdown: 'text' } })).toEqual([]);
    expect(getIssues({ body: null })).toEqual([]);
    expect(getIssues({ title: 'a plain string' })).toEqual([]);
  });
});

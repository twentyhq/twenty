import { FieldMetadataType } from 'twenty-shared/types';

import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
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
  it('returns an error issue for a bare-string rich text value', () => {
    const issues = getIssues({ body: 'Hello {{name}}' });

    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      severity: 'error',
      code: 'INVALID_RICH_TEXT_FIELD',
      stepId: 'step-1',
    });
    expect(issues[0].message).toContain('body');
  });

  it('returns an error issue for arrays and malformed objects', () => {
    expect(getIssues({ body: ['x'] })).toHaveLength(1);
    expect(getIssues({ body: { blocknote: 123 } })).toHaveLength(1);
    expect(getIssues({ body: { unexpectedKey: 'x' } })).toHaveLength(1);
  });

  it('returns no issues for valid rich text values', () => {
    expect(getIssues({ body: { blocknote: '[]', markdown: null } })).toEqual(
      [],
    );
    expect(getIssues({ body: { markdown: 'text' } })).toEqual([]);
    expect(getIssues({ body: null })).toEqual([]);
    expect(getIssues({})).toEqual([]);
  });

  it('ignores non-rich-text fields', () => {
    expect(getIssues({ title: 'a plain string' })).toEqual([]);
  });
});

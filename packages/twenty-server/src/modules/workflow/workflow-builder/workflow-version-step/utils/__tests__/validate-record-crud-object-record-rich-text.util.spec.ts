import { FieldMetadataType } from 'twenty-shared/types';

import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { validateRecordCrudObjectRecordRichTextOrThrow } from 'src/modules/workflow/workflow-builder/workflow-version-step/utils/validate-record-crud-object-record-rich-text.util';

type TestField = {
  id: string;
  name: string;
  type: FieldMetadataType;
};

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
  {
    id: 'field-1',
    name: 'relationshipSummary',
    type: FieldMetadataType.RICH_TEXT,
  },
  { id: 'field-2', name: 'name', type: FieldMetadataType.TEXT },
]);

const validate = (objectRecord: Record<string, unknown>) =>
  validateRecordCrudObjectRecordRichTextOrThrow({
    objectRecord,
    objectMetadataInfo,
    stepLabel: 'Create person',
  });

describe('validateRecordCrudObjectRecordRichTextOrThrow', () => {
  it('throws when a rich text field holds a bare string', () => {
    expect(() =>
      validate({ relationshipSummary: 'Latest donation: {{amount}}' }),
    ).toThrow('Rich text field "relationshipSummary"');
  });

  it('accepts the { blocknote, markdown } object shape', () => {
    expect(() =>
      validate({ relationshipSummary: { blocknote: '[]', markdown: null } }),
    ).not.toThrow();
  });

  it('accepts a null or absent rich text value', () => {
    expect(() => validate({ relationshipSummary: null })).not.toThrow();
    expect(() => validate({ name: 'Amina' })).not.toThrow();
  });

  it('does not constrain non-rich-text fields', () => {
    expect(() => validate({ name: 'Amina' })).not.toThrow();
  });
});

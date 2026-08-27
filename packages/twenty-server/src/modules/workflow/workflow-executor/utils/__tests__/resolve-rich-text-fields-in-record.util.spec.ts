import { FieldMetadataType } from 'twenty-shared/types';

import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { resolveRichTextFieldsInRecord } from 'src/modules/workflow/workflow-executor/utils/resolve-rich-text-fields-in-record.util';

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
    flatFieldMetadataMaps: {
      byUniversalIdentifier,
      universalIdentifierById,
    },
  } as unknown as ObjectMetadataInfo;
};

describe('resolveRichTextFieldsInRecord', () => {
  const objectMetadataInfo = buildObjectMetadataInfo([
    { id: 'field-1', name: 'body', type: FieldMetadataType.RICH_TEXT },
  ]);

  it('resolves variables inside a blocknote object value', () => {
    const blocknote = `[{"type":"paragraph","content":[{"type":"variableTag","attrs":{"variable":"{{trigger.amount}}"}}]}]`;

    const result = resolveRichTextFieldsInRecord(
      { body: { blocknote } },
      objectMetadataInfo,
      { trigger: { amount: 42 } },
    );

    expect(result.body).toEqual({
      blocknote: `[{"type":"paragraph","content":[{"type":"text","text":"42"}]}]`,
    });
  });

  it('leaves a rich text field holding a raw string template untouched', () => {
    const objectRecord = { body: 'Latest donation: {{trigger.amount}}' };

    const result = resolveRichTextFieldsInRecord(
      objectRecord,
      objectMetadataInfo,
      {
        trigger: { amount: 42 },
      },
    );

    expect(result.body).toBe('Latest donation: {{trigger.amount}}');
  });

  it('leaves a null rich text field untouched', () => {
    const result = resolveRichTextFieldsInRecord(
      { body: null },
      objectMetadataInfo,
      {},
    );

    expect(result.body).toBeNull();
  });
});

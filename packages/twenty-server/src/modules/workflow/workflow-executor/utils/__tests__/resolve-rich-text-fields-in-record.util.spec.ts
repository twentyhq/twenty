import { FieldMetadataType } from 'twenty-shared/types';

import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { resolveRichTextFieldsInRecord } from 'src/modules/workflow/workflow-executor/utils/resolve-rich-text-fields-in-record.util';

const objectMetadataInfo = {
  flatObjectMetadata: { fieldIds: ['body-field', 'title-field'] },
  flatFieldMetadataMaps: {
    byUniversalIdentifier: {
      'body-universal-id': {
        id: 'body-field',
        name: 'body',
        type: FieldMetadataType.RICH_TEXT,
      },
      'title-universal-id': {
        id: 'title-field',
        name: 'title',
        type: FieldMetadataType.TEXT,
      },
    },
    universalIdentifierById: {
      'body-field': 'body-universal-id',
      'title-field': 'title-universal-id',
    },
  },
} as unknown as ObjectMetadataInfo;

const context = {
  trigger: { body: { amount: 42, currency: 'EUR', meta: { source: 'form' } } },
};

describe('resolveRichTextFieldsInRecord', () => {
  it('keeps a markdown that is exactly one variable a string', () => {
    const resolved = resolveRichTextFieldsInRecord(
      { body: { markdown: '{{trigger.body.amount}}', blocknote: null } },
      objectMetadataInfo,
      context,
    );

    expect(resolved.body).toEqual({ markdown: '42', blocknote: null });
  });

  it('interpolates variables inside a markdown', () => {
    const resolved = resolveRichTextFieldsInRecord(
      {
        body: {
          markdown:
            'Latest donation: {{trigger.body.amount}} {{trigger.body.currency}}',
          blocknote: null,
        },
      },
      objectMetadataInfo,
      context,
    );

    expect(resolved.body).toEqual({
      markdown: 'Latest donation: 42 EUR',
      blocknote: null,
    });
  });

  it('serializes an object resolved from a whole-string variable', () => {
    const resolved = resolveRichTextFieldsInRecord(
      { body: { markdown: '{{trigger.body.meta}}', blocknote: null } },
      objectMetadataInfo,
      context,
    );

    expect(resolved.body).toEqual({
      markdown: '{"source":"form"}',
      blocknote: null,
    });
  });

  it('leaves a non-object rich text value untouched instead of crashing', () => {
    const resolved = resolveRichTextFieldsInRecord(
      { body: 'legacy bare string {{trigger.body.amount}}', title: 'x' },
      objectMetadataInfo,
      context,
    );

    expect(resolved.body).toBe('legacy bare string {{trigger.body.amount}}');
  });

  it('does not touch fields that are not rich text', () => {
    const resolved = resolveRichTextFieldsInRecord(
      {
        title: '{{trigger.body.amount}}',
        body: { markdown: 'a', blocknote: null },
      },
      objectMetadataInfo,
      context,
    );

    expect(resolved.title).toBe('{{trigger.body.amount}}');
  });
});

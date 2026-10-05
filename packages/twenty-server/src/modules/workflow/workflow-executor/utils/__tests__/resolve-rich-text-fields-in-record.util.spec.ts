import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { resolveRichTextFieldsInRecord } from 'src/modules/workflow/workflow-executor/utils/resolve-rich-text-fields-in-record.util';

const bodyField = getFlatFieldMetadataMock({
  id: 'body-field',
  universalIdentifier: 'body-universal-id',
  objectMetadataId: 'note-object',
  name: 'body',
  type: FieldMetadataType.RICH_TEXT,
});

const titleField = getFlatFieldMetadataMock({
  id: 'title-field',
  universalIdentifier: 'title-universal-id',
  objectMetadataId: 'note-object',
  name: 'title',
  type: FieldMetadataType.TEXT,
});

const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> = {
  byUniversalIdentifier: {
    [bodyField.universalIdentifier]: bodyField,
    [titleField.universalIdentifier]: titleField,
  },
  universalIdentifierById: {
    [bodyField.id]: bodyField.universalIdentifier,
    [titleField.id]: titleField.universalIdentifier,
  },
  universalIdentifiersByApplicationId: {},
};

const objectMetadataInfo = {
  flatObjectMetadata: getFlatObjectMetadataMock({
    id: 'note-object',
    universalIdentifier: 'note-universal-id',
    nameSingular: 'note',
    namePlural: 'notes',
    fieldIds: [bodyField.id, titleField.id],
  }),
  flatFieldMetadataMaps,
};

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

  it('leaves a value that is not a rich text object untouched', () => {
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

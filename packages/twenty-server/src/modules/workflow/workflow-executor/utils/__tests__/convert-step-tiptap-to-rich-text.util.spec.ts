import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { convertStepTipTapToRichText } from 'src/modules/workflow/workflow-executor/utils/convert-step-tiptap-to-rich-text.util';

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

describe('convertStepTipTapToRichText', () => {
  it('keeps a markdown that is exactly one variable a string', () => {
    const resolved = convertStepTipTapToRichText(
      { body: { markdown: '{{trigger.body.amount}}', blocknote: null } },
      objectMetadataInfo,
      context,
    );

    expect(resolved.body).toEqual({ markdown: '42', blocknote: null });
  });

  it('interpolates variables inside a markdown', () => {
    const resolved = convertStepTipTapToRichText(
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
    const resolved = convertStepTipTapToRichText(
      { body: { markdown: '{{trigger.body.meta}}', blocknote: null } },
      objectMetadataInfo,
      context,
    );

    expect(resolved.body).toEqual({
      markdown: '{"source":"form"}',
      blocknote: null,
    });
  });

  it('converts a TipTap body into BlockNote after resolving its variables', () => {
    const tipTapBody = JSON.stringify([
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Amount', marks: [{ type: 'bold' }] },
          { type: 'text', text: ': ' },
          {
            type: 'variableTag',
            attrs: { variable: '{{trigger.body.amount}}' },
          },
        ],
      },
    ]);

    const resolved = convertStepTipTapToRichText(
      { body: { blocknote: tipTapBody, markdown: null } },
      objectMetadataInfo,
      context,
    );

    const { blocknote, markdown } = resolved.body as {
      blocknote: string;
      markdown: string;
    };

    expect(markdown).toBe('**Amount**: 42');
    expect(JSON.parse(blocknote)[0]).toMatchObject({
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Amount', styles: { bold: true } },
        { type: 'text', text: ': 42' },
      ],
    });
  });

  it('leaves a value that is not a rich text object untouched', () => {
    const resolved = convertStepTipTapToRichText(
      { body: 'legacy bare string {{trigger.body.amount}}', title: 'x' },
      objectMetadataInfo,
      context,
    );

    expect(resolved.body).toBe('legacy bare string {{trigger.body.amount}}');
  });

  it('does not touch fields that are not rich text', () => {
    const resolved = convertStepTipTapToRichText(
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

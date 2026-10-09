import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { resolveRichTextMarkdownVariables } from 'src/modules/workflow/workflow-executor/utils/resolve-rich-text-markdown-variables.util';

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

describe('resolveRichTextMarkdownVariables', () => {
  it.each([
    { markdown: '{{trigger.body.amount}}', expected: '42' },
    {
      markdown:
        'Latest donation: {{trigger.body.amount}} {{trigger.body.currency}}',
      expected: 'Latest donation: 42 EUR',
    },
    { markdown: '{{trigger.body.meta}}', expected: '{"source":"form"}' },
  ])('resolves $markdown into a string', ({ markdown, expected }) => {
    const resolved = resolveRichTextMarkdownVariables(
      { body: { markdown, blocknote: '{{codeStep.report.blocknote}}' } },
      objectMetadataInfo,
      context,
    );

    expect(resolved.body).toEqual({
      markdown: expected,
      blocknote: '{{codeStep.report.blocknote}}',
    });
  });

  it('does not touch fields that are not rich text', () => {
    const resolved = resolveRichTextMarkdownVariables(
      { title: '{{trigger.body.amount}}' },
      objectMetadataInfo,
      context,
    );

    expect(resolved.title).toBe('{{trigger.body.amount}}');
  });
});

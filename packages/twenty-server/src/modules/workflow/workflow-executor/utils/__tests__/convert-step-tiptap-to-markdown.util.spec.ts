import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { convertStepTipTapToMarkdown } from 'src/modules/workflow/workflow-executor/utils/convert-step-tiptap-to-markdown.util';

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
  trigger: {
    body: { amount: 42, currency: 'EUR', meta: { source: 'form' } },
    url: 'https://twenty.com',
  },
};

describe('convertStepTipTapToMarkdown', () => {
  it('keeps a markdown that is exactly one variable a string', () => {
    const resolved = convertStepTipTapToMarkdown(
      { body: { markdown: '{{trigger.body.amount}}', blocknote: null } },
      objectMetadataInfo,
      context,
    );

    expect(resolved.body).toEqual({ markdown: '42', blocknote: null });
  });

  it('interpolates variables inside a markdown', () => {
    const resolved = convertStepTipTapToMarkdown(
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
    const resolved = convertStepTipTapToMarkdown(
      { body: { markdown: '{{trigger.body.meta}}', blocknote: null } },
      objectMetadataInfo,
      context,
    );

    expect(resolved.body).toEqual({
      markdown: '{"source":"form"}',
      blocknote: null,
    });
  });

  it('converts a TipTap body into markdown after resolving its variables', () => {
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

    const resolved = convertStepTipTapToMarkdown(
      { body: { blocknote: tipTapBody, markdown: null } },
      objectMetadataInfo,
      context,
    );

    expect(resolved.body).toEqual({ markdown: '**Amount**: 42' });
  });

  it('resolves a bold variable chip into a markdown string', () => {
    const tipTapBody = JSON.stringify([
      {
        type: 'paragraph',
        content: [
          {
            type: 'variableTag',
            attrs: { variable: '{{trigger.body.amount}}' },
            marks: [{ type: 'bold' }],
          },
        ],
      },
    ]);

    const resolved = convertStepTipTapToMarkdown(
      { body: { blocknote: tipTapBody, markdown: null } },
      objectMetadataInfo,
      context,
    );

    expect(resolved.body).toEqual({ markdown: '42' });
  });

  it('resolves a variable used as a link destination', () => {
    const tipTapBody = JSON.stringify([
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Website',
            marks: [{ type: 'link', attrs: { href: '{{trigger.url}}' } }],
          },
        ],
      },
    ]);

    const resolved = convertStepTipTapToMarkdown(
      { body: { blocknote: tipTapBody, markdown: null } },
      objectMetadataInfo,
      context,
    );

    expect(resolved.body).toEqual({
      markdown: '[Website](https://twenty.com)',
    });
  });

  it('leaves a BlockNote body to the record write', () => {
    const blocknoteBody = JSON.stringify([
      {
        id: 'b1',
        type: 'paragraph',
        props: {},
        children: [],
        content: [{ type: 'text', text: 'Bold', styles: { bold: true } }],
      },
    ]);

    const resolved = convertStepTipTapToMarkdown(
      { body: { blocknote: blocknoteBody, markdown: null } },
      objectMetadataInfo,
      context,
    );

    expect(resolved.body).toEqual({ blocknote: blocknoteBody, markdown: null });
  });

  it('keeps a blocknote variable for the input resolution', () => {
    const resolved = convertStepTipTapToMarkdown(
      {
        body: {
          blocknote: '{{codeStep.report.blocknote}}',
          markdown: '{{trigger.body.amount}}',
        },
      },
      objectMetadataInfo,
      context,
    );

    expect(resolved.body).toEqual({
      blocknote: '{{codeStep.report.blocknote}}',
      markdown: '42',
    });
  });

  it('leaves a value that is not a rich text object untouched', () => {
    const resolved = convertStepTipTapToMarkdown(
      { body: 'legacy bare string {{trigger.body.amount}}', title: 'x' },
      objectMetadataInfo,
      context,
    );

    expect(resolved.body).toBe('legacy bare string {{trigger.body.amount}}');
  });

  it('does not touch fields that are not rich text', () => {
    const resolved = convertStepTipTapToMarkdown(
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

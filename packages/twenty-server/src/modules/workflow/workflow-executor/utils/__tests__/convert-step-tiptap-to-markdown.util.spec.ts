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

const paragraph = (content: unknown[]) =>
  JSON.stringify([{ type: 'paragraph', content }]);

describe('convertStepTipTapToMarkdown', () => {
  it('converts a TipTap body into markdown, keeping its variables', () => {
    const tipTapBody = paragraph([
      { type: 'text', text: 'Amount', marks: [{ type: 'bold' }] },
      { type: 'text', text: ': ' },
      { type: 'variableTag', attrs: { variable: '{{trigger.body.amount}}' } },
    ]);

    const converted = convertStepTipTapToMarkdown(
      { body: { blocknote: tipTapBody, markdown: null } },
      objectMetadataInfo,
    );

    expect(converted.body).toEqual({
      markdown: '**Amount**: {{trigger.body.amount}}',
    });
  });

  it('keeps a variable used as a link destination', () => {
    const tipTapBody = paragraph([
      {
        type: 'text',
        text: 'Website',
        marks: [{ type: 'link', attrs: { href: '{{trigger.url}}' } }],
      },
    ]);

    const converted = convertStepTipTapToMarkdown(
      { body: { blocknote: tipTapBody, markdown: null } },
      objectMetadataInfo,
    );

    expect(converted.body).toEqual({ markdown: '[Website]({{trigger.url}})' });
  });

  it.each([
    {
      name: 'a markdown only value',
      value: { blocknote: null, markdown: '{{trigger.body.amount}}' },
    },
    {
      name: 'a blocknote variable',
      value: {
        blocknote: '{{codeStep.report.blocknote}}',
        markdown: '{{codeStep.report.markdown}}',
      },
    },
    {
      name: 'a BlockNote body',
      value: {
        blocknote: JSON.stringify([
          {
            id: 'b1',
            type: 'paragraph',
            props: {},
            children: [],
            content: [{ type: 'text', text: 'Bold', styles: { bold: true } }],
          },
        ]),
        markdown: null,
      },
    },
    { name: 'a value that is not a rich text object', value: 'legacy' },
  ])('leaves $name untouched', ({ value }) => {
    const converted = convertStepTipTapToMarkdown(
      { body: value },
      objectMetadataInfo,
    );

    expect(converted.body).toEqual(value);
  });

  it('does not touch fields that are not rich text', () => {
    const tipTapBody = paragraph([{ type: 'text', text: 'Hello' }]);

    const converted = convertStepTipTapToMarkdown(
      { title: tipTapBody },
      objectMetadataInfo,
    );

    expect(converted.title).toBe(tipTapBody);
  });
});

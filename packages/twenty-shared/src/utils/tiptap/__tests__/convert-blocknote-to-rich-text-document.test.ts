import { convertBlockNoteToRichTextDocument } from '../convert-blocknote-to-rich-text-document';
import { richTextDocumentSchema } from '../rich-text-document-schema';
import { TIPTAP_DOCUMENT_SCHEMA_VERSION } from '../tiptap-document-schema-version';

const DEFAULT_PROPS = {
  textColor: 'default',
  backgroundColor: 'default',
  textAlignment: 'left',
};

const block = (
  type: string,
  content: unknown,
  props: Record<string, unknown> = {},
  children: unknown[] = [],
) => ({
  id: `${type}-id`,
  type,
  props: { ...DEFAULT_PROPS, ...props },
  content,
  children,
});

const text = (value: string, styles: Record<string, unknown> = {}) => ({
  type: 'text',
  text: value,
  styles,
});

const convert = (blocks: unknown[]) => {
  const document = convertBlockNoteToRichTextDocument(JSON.stringify(blocks));

  expect(richTextDocumentSchema.safeParse(document).success).toBe(true);

  return document?.content;
};

describe('convertBlockNoteToRichTextDocument', () => {
  it('should convert headings, styled text and a run of bullet items into one list', () => {
    expect(
      convert([
        block('heading', [text('Meeting')], { level: 2, isToggleable: false }),
        block('paragraph', [text('Hello '), text('world', { bold: true })]),
        block('bulletListItem', [text('Item one')]),
        block('bulletListItem', [text('Item two')]),
      ]),
    ).toEqual([
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Meeting' }],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Hello ' },
          { type: 'text', text: 'world', marks: [{ type: 'bold' }] },
        ],
      },
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Item one' }],
              },
            ],
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Item two' }],
              },
            ],
          },
        ],
      },
    ]);
  });

  it('should stamp the schema version and keep an empty note editable', () => {
    expect(convertBlockNoteToRichTextDocument('[]')).toEqual({
      type: 'doc',
      attrs: { schemaVersion: TIPTAP_DOCUMENT_SCHEMA_VERSION },
      content: [{ type: 'paragraph' }],
    });
  });

  it('should not convert a value that is not a BlockNote block array', () => {
    expect(convertBlockNoteToRichTextDocument('not json')).toBeUndefined();
    expect(
      convertBlockNoteToRichTextDocument(
        JSON.stringify({ type: 'doc', content: [] }),
      ),
    ).toBeUndefined();
  });

  it('should nest the children of a list item and indent the children of other blocks', () => {
    expect(
      convert([
        block('bulletListItem', [text('Parent')], {}, [
          block('numberedListItem', [text('Child')]),
        ]),
        block('paragraph', [text('Intro')], {}, [
          block('paragraph', [text('Indented')], {}, [
            block('bulletListItem', [text('Deeper')]),
            block('image', undefined, { url: 'https://twenty.com/a.png' }),
          ]),
        ]),
      ]),
    ).toEqual([
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Parent' }],
              },
              {
                type: 'orderedList',
                content: [
                  {
                    type: 'listItem',
                    content: [
                      {
                        type: 'paragraph',
                        content: [{ type: 'text', text: 'Child' }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      { type: 'paragraph', content: [{ type: 'text', text: 'Intro' }] },
      {
        type: 'paragraph',
        attrs: { indent: 1 },
        content: [{ type: 'text', text: 'Indented' }],
      },
      {
        type: 'bulletList',
        attrs: { indent: 2 },
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Deeper' }],
              },
            ],
          },
        ],
      },
      {
        type: 'image',
        attrs: {
          src: 'https://twenty.com/a.png',
          alt: null,
          title: null,
          width: null,
        },
      },
    ]);
  });

  it('should restart an ordered list where an item sets its start number', () => {
    const lists = convert([
      block('numberedListItem', [text('One')]),
      block('numberedListItem', [text('Two')]),
      block('numberedListItem', [text('Five')], { start: 5 }),
    ]);

    expect(
      lists?.map(({ type, attrs, content }) => [type, attrs, content?.length]),
    ).toEqual([
      ['orderedList', undefined, 2],
      ['orderedList', { start: 5 }, 1],
    ]);
  });

  it('should convert check list items and keep toggle list items and toggle headings with their id and children', () => {
    expect(
      convert([
        block('checkListItem', [text('Done')], { checked: true }),
        block('checkListItem', [text('Todo')], { checked: false }),
        block('toggleListItem', [text('Toggle')], {}, [
          block('paragraph', [text('Hidden')]),
        ]),
        block('heading', [text('Section')], { level: 2, isToggleable: true }),
      ]),
    ).toEqual([
      {
        type: 'taskList',
        content: [
          {
            type: 'taskItem',
            attrs: { checked: true },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'Done' }] },
            ],
          },
          {
            type: 'taskItem',
            attrs: { checked: false },
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'Todo' }] },
            ],
          },
        ],
      },
      {
        type: 'toggle',
        attrs: { id: 'toggleListItem-id' },
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'Toggle' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Hidden' }] },
        ],
      },
      {
        type: 'toggle',
        attrs: { id: 'heading-id' },
        content: [
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Section' }],
          },
        ],
      },
    ]);
  });

  it('should convert links, mentions, inline code and line breaks', () => {
    expect(
      convert([
        block('paragraph', [
          {
            type: 'link',
            href: 'https://twenty.com',
            content: [text('Twenty', { italic: true, code: true })],
          },
          text(' and '),
          {
            type: 'mention',
            props: {
              recordId: '20202020-0000-4000-8000-000000000001',
              objectMetadataId: '20202020-0000-4000-8000-000000000002',
              objectNameSingular: 'person',
              label: 'Ada Lovelace',
              imageUrl: '',
            },
          },
          text('npm run\nnext line', { code: true }),
        ]),
      ]),
    ).toEqual([
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Twenty',
            marks: [
              { type: 'italic' },
              { type: 'link', attrs: { href: 'https://twenty.com' } },
            ],
          },
          { type: 'text', text: ' and ' },
          {
            type: 'mentionTag',
            attrs: {
              recordId: '20202020-0000-4000-8000-000000000001',
              objectNameSingular: 'person',
              label: 'Ada Lovelace',
              imageUrl: '',
            },
          },
          { type: 'text', text: 'npm run', marks: [{ type: 'code' }] },
          { type: 'hardBreak' },
          { type: 'text', text: 'next line', marks: [{ type: 'code' }] },
        ],
      },
    ]);
  });

  it('should keep the named colors BlockNote displays and drop pasted CSS colors', () => {
    expect(
      convert([
        block(
          'paragraph',
          [
            text('Inherits red'),
            text('Own highlight', { backgroundColor: 'yellow' }),
            text('Pasted', { textColor: 'rgb(0, 0, 0)' }),
          ],
          { textColor: 'red', textAlignment: 'center' },
        ),
        block('paragraph', [text('Plain', { textColor: 'rgb(34, 34, 34)' })]),
      ]),
    ).toEqual([
      {
        type: 'paragraph',
        attrs: { textAlign: 'center' },
        content: [
          {
            type: 'text',
            text: 'Inherits red',
            marks: [
              {
                type: 'textStyle',
                attrs: { textColor: 'red', backgroundColor: null },
              },
            ],
          },
          {
            type: 'text',
            text: 'Own highlight',
            marks: [
              {
                type: 'textStyle',
                attrs: { textColor: 'red', backgroundColor: 'yellow' },
              },
            ],
          },
          {
            type: 'text',
            text: 'Pasted',
            marks: [
              {
                type: 'textStyle',
                attrs: { textColor: 'red', backgroundColor: null },
              },
            ],
          },
        ],
      },
      { type: 'paragraph', content: [{ type: 'text', text: 'Plain' }] },
    ]);
  });

  it('should convert quotes, code blocks, dividers and keep heading levels up to 6', () => {
    expect(
      convert([
        block('quote', [text('Quoted')]),
        block('codeBlock', [text('const a = 1;\nconst b = 2;')], {
          language: 'typescript',
        }),
        block('divider', undefined),
        block('heading', [text('Small title')], { level: 5 }),
        block('heading', [text('Too deep')], { level: 9 }),
      ]),
    ).toEqual([
      {
        type: 'blockquote',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'Quoted' }] },
        ],
      },
      {
        type: 'codeBlock',
        attrs: { language: 'typescript' },
        content: [{ type: 'text', text: 'const a = 1;\nconst b = 2;' }],
      },
      { type: 'divider' },
      {
        type: 'heading',
        attrs: { level: 5 },
        content: [{ type: 'text', text: 'Small title' }],
      },
      {
        type: 'heading',
        attrs: { level: 6 },
        content: [{ type: 'text', text: 'Too deep' }],
      },
    ]);
  });

  it('should convert a table with a header row, column widths and legacy cells', () => {
    expect(
      convert([
        block('table', {
          type: 'tableContent',
          columnWidths: [120, null],
          headerRows: 1,
          rows: [
            {
              cells: [
                {
                  type: 'tableCell',
                  props: { colspan: 1, rowspan: 1 },
                  content: [text('Name')],
                },
                {
                  type: 'tableCell',
                  props: { colspan: 1, rowspan: 1 },
                  content: [text('Stage')],
                },
              ],
            },
            { cells: [[text('Acme')], []] },
          ],
        }),
      ]),
    ).toEqual([
      {
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableHeader',
                attrs: { colspan: 1, rowspan: 1, colwidth: [120] },
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Name' }],
                  },
                ],
              },
              {
                type: 'tableHeader',
                attrs: { colspan: 1, rowspan: 1, colwidth: null },
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Stage' }],
                  },
                ],
              },
            ],
          },
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableCell',
                attrs: { colspan: 1, rowspan: 1, colwidth: [120] },
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Acme' }],
                  },
                ],
              },
              {
                type: 'tableCell',
                attrs: { colspan: 1, rowspan: 1, colwidth: null },
                content: [{ type: 'paragraph' }],
              },
            ],
          },
        ],
      },
    ]);
  });

  it('should convert images, files and videos and skip blocks still waiting for an upload', () => {
    expect(
      convert([
        block('image', undefined, {
          url: 'https://example.com/chart.png',
          caption: '',
          name: 'chart.png',
          previewWidth: 512,
          showPreview: true,
        }),
        block('image', undefined, {
          url: 'https://example.com/team.png',
          caption: 'The team at the offsite',
          name: 'team.png',
        }),
        block('image', undefined, { url: '', name: '' }),
        block('file', undefined, {
          url: 'https://example.com/contract.pdf',
          name: 'contract.pdf',
        }),
        block('video', undefined, {
          url: 'https://example.com/demo.mp4',
          name: '',
        }),
      ]),
    ).toEqual([
      {
        type: 'image',
        attrs: {
          src: 'https://example.com/chart.png',
          alt: 'chart.png',
          title: null,
          width: 512,
        },
      },
      {
        type: 'image',
        attrs: {
          src: 'https://example.com/team.png',
          alt: 'team.png',
          title: 'The team at the offsite',
          width: null,
        },
      },
      {
        type: 'file',
        attrs: {
          url: 'https://example.com/contract.pdf',
          name: 'contract.pdf',
        },
      },
      {
        type: 'file',
        attrs: { url: 'https://example.com/demo.mp4', name: null },
      },
    ]);
  });

  it('should only produce documents the rich text write validator accepts', () => {
    const longUrl = `https://example.com/${'a'.repeat(4_000)}`;

    const document = convertBlockNoteToRichTextDocument(
      JSON.stringify([
        block('paragraph', [
          {
            type: 'link',
            href: 'javascript:alert(1)',
            content: [text('Unsafe')],
          },
          { type: 'link', href: longUrl, content: [text('Too long')] },
          { type: 'link', href: '/objects/people', content: [text('Safe')] },
        ]),
        block('heading', [text('Half level')], { level: 2.5 }),
        block('numberedListItem', [text('Fractional')], { start: 2.7 }),
        block('numberedListItem', [text('Negative')], { start: -4 }),
        block('image', undefined, { url: 'javascript:alert(1)', name: 'x' }),
        block('image', undefined, { url: longUrl, name: 'long.png' }),
        block('file', undefined, { url: 'data:text/html,hi', name: 'evil' }),
        block('audio', undefined, { url: longUrl, name: 'long.mp3' }),
      ]),
    );

    expect(richTextDocumentSchema.safeParse(document).success).toBe(true);
    expect(document?.content).toEqual([
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Unsafe' },
          { type: 'text', text: 'Too long' },
          {
            type: 'text',
            text: 'Safe',
            marks: [{ type: 'link', attrs: { href: '/objects/people' } }],
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Half level' }],
      },
      {
        type: 'orderedList',
        attrs: { start: 2 },
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Fractional' }],
              },
            ],
          },
        ],
      },
      {
        type: 'orderedList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Negative' }],
              },
            ],
          },
        ],
      },
    ]);
  });
});

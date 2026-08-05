import {
  parseCanonicalTipTapJsonDocument,
  parseTipTapJsonDocument,
} from '../parse-tiptap-json-document';
import { TIPTAP_DOCUMENT_SCHEMA_VERSION } from '../tiptap-document-schema-version';
import { tipTapDocumentToMarkdown } from '../tiptap-document-to-markdown';

const document = {
  type: 'doc' as const,
  attrs: { schemaVersion: TIPTAP_DOCUMENT_SCHEMA_VERSION },
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Overview' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Hello ' },
        {
          type: 'text',
          text: 'Ada',
          marks: [
            { type: 'bold' as const },
            {
              type: 'link' as const,
              attrs: { href: 'https://example.com' },
            },
          ],
        },
        { type: 'text', text: ' ' },
        {
          type: 'mentionTag',
          attrs: {
            objectNameSingular: 'person',
            recordId: 'person-id',
            label: 'Ada Lovelace',
          },
        },
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
              content: [{ type: 'text', text: 'First' }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Second' }],
            },
          ],
        },
      ],
    },
  ],
};

describe('TipTap document primitives', () => {
  it('parses a structurally valid document without filtering extensions', () => {
    expect(parseTipTapJsonDocument(JSON.stringify(document))).toEqual(document);
  });

  it('parses only documents with the current canonical schema version', () => {
    expect(parseCanonicalTipTapJsonDocument(JSON.stringify(document))).toEqual(
      document,
    );
    expect(
      parseCanonicalTipTapJsonDocument(
        JSON.stringify({ type: 'doc', content: [] }),
      ),
    ).toBeUndefined();
    expect(
      parseCanonicalTipTapJsonDocument(
        JSON.stringify({
          type: 'doc',
          attrs: { schemaVersion: TIPTAP_DOCUMENT_SCHEMA_VERSION + 1 },
          content: [],
        }),
      ),
    ).toBeUndefined();
  });

  it('rejects malformed nested nodes and marks', () => {
    expect(
      parseTipTapJsonDocument(
        JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', marks: [{ attrs: {} }] }],
            },
          ],
        }),
      ),
    ).toBeUndefined();
  });

  it('projects canonical documents to Markdown at text boundaries', () => {
    expect(tipTapDocumentToMarkdown(document)).toBe(
      [
        '## Overview',
        '',
        'Hello [**Ada**](https://example.com) [[record:person:person-id:Ada Lovelace[[/record]]',
        '',
        '- First',
        '- Second',
      ].join('\n'),
    );
  });

  it('preserves nested list hierarchy in Markdown projections', () => {
    expect(
      tipTapDocumentToMarkdown({
        type: 'doc',
        content: [
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
                    attrs: { start: 3 },
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
        ],
      }),
    ).toBe(['- Parent', '', '  3. Child'].join('\n'));
  });

  it('escapes literal Markdown text and link destinations', () => {
    expect(
      tipTapDocumentToMarkdown({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: '1. Literal *stars* [brackets] ' },
              {
                type: 'text',
                text: 'linked',
                marks: [
                  {
                    type: 'link',
                    attrs: { href: 'https://example.com/a_(b c)' },
                  },
                ],
              },
            ],
          },
          {
            type: 'image',
            attrs: {
              alt: '[diagram]',
              src: 'https://example.com/a(b c).png',
            },
          },
        ],
      }),
    ).toBe(
      [
        '1\\. Literal \\*stars\\* \\[brackets\\] [linked](https://example.com/a_%28b%20c%29)',
        '',
        '![\\[diagram\\]](https://example.com/a%28b%20c%29.png)',
      ].join('\n'),
    );
  });

  it('passes legacy text through unchanged', () => {
    expect(tipTapDocumentToMarkdown('Legacy **Markdown**')).toBe(
      'Legacy **Markdown**',
    );
  });
});

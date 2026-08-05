import { parseTipTapJsonDocument } from '../parse-tiptap-json-document';
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

  it('passes legacy text through unchanged', () => {
    expect(tipTapDocumentToMarkdown('Legacy **Markdown**')).toBe(
      'Legacy **Markdown**',
    );
  });
});

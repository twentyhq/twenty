import { EMAIL_DOCUMENT_SCHEMA_VERSION } from '../email-document-schema-version';
import {
  parseCanonicalEmailDocument,
  parseEmailDocument,
} from '../parse-email-document';

const paragraph = (text: string) => ({
  type: 'paragraph',
  content: [{ type: 'text', text }],
});

describe('parseEmailDocument', () => {
  it('should accept a full composer document', () => {
    const document = {
      type: 'doc',
      attrs: {
        schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION,
        canvasTheme: {
          pageBackground: '#f4f4f5',
          bodyBackground: '#ffffff',
          width: '600px',
          textAlign: 'left',
        },
      },
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Hello' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Hi ' },
            { type: 'variableTag', attrs: { variable: '{{firstName}}' } },
            { type: 'hardBreak' },
            {
              type: 'text',
              text: 'read this',
              marks: [
                { type: 'bold' },
                { type: 'link', attrs: { href: 'https://example.com' } },
              ],
            },
          ],
        },
        {
          type: 'section',
          attrs: { style: { padding: '12px', backgroundColor: '#eeeeee' } },
          content: [
            paragraph('Inside the section'),
            {
              type: 'section',
              attrs: { style: { padding: '4px' } },
              content: [paragraph('Nested')],
            },
          ],
        },
        {
          type: 'columns',
          attrs: { style: {} },
          content: [
            {
              type: 'column',
              attrs: { style: {} },
              content: [paragraph('Left')],
            },
            {
              type: 'column',
              attrs: { style: {} },
              content: [paragraph('Right')],
            },
          ],
        },
        {
          type: 'button',
          attrs: {
            href: 'https://example.com/{{personId}}',
            style: { color: '#fff' },
          },
          content: [{ type: 'text', text: 'Click me' }],
        },
        {
          type: 'bulletList',
          content: [{ type: 'listItem', content: [paragraph('Item')] }],
        },
        {
          type: 'image',
          attrs: {
            fileId: '3c5bc42f-e6a8-4a56-a0ca-8b36f3e31db6',
            src: 'https://example.com/a.png',
            alt: null,
            width: 300,
            href: '',
          },
        },
        { type: 'divider', attrs: { style: { borderTopWidth: '1px' } } },
        { type: 'html', attrs: { html: '<p>raw</p>' } },
      ],
    };

    expect(parseEmailDocument(document)).toEqual({
      success: true,
      document: expect.objectContaining({ type: 'doc' }),
    });
  });

  it('should accept a document without schemaVersion or theme', () => {
    const result = parseEmailDocument({
      type: 'doc',
      content: [paragraph('Legacy body')],
    });

    expect(result.success).toBe(true);
  });

  it('should require the current schema version at canonical boundaries', () => {
    expect(
      parseCanonicalEmailDocument({
        type: 'doc',
        attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
        content: [paragraph('Current body')],
      }).success,
    ).toBe(true);
    expect(
      parseCanonicalEmailDocument({
        type: 'doc',
        content: [paragraph('Legacy body')],
      }),
    ).toEqual({
      success: false,
      error: `attrs.schemaVersion: Expected ${EMAIL_DOCUMENT_SCHEMA_VERSION}`,
    });
  });

  it('should accept an empty document', () => {
    expect(parseEmailDocument({ type: 'doc' }).success).toBe(true);
  });

  it('should keep unknown attribute keys', () => {
    const result = parseEmailDocument({
      type: 'doc',
      content: [
        {
          type: 'image',
          attrs: { src: 'https://a.png', futureAttribute: 'kept' },
        },
      ],
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.document.content?.[0].attrs?.futureAttribute).toBe('kept');
    }
  });

  it('should reject an unknown node type', () => {
    const result = parseEmailDocument({
      type: 'doc',
      content: [{ type: 'countdownTimer', attrs: {} }],
    });

    expect(result).toEqual({
      success: false,
      error: expect.stringContaining('content.0'),
    });
  });

  it('should reject a document from a future schema version', () => {
    const result = parseEmailDocument({
      type: 'doc',
      attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION + 1 },
      content: [paragraph('Hello')],
    });

    expect(result.success).toBe(false);
  });

  it('should reject a heading level outside 1-3', () => {
    const result = parseEmailDocument({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 4 },
          content: [{ type: 'text', text: 'Hi' }],
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it('should reject columns with fewer than two columns', () => {
    const result = parseEmailDocument({
      type: 'doc',
      content: [
        {
          type: 'columns',
          attrs: { style: {} },
          content: [
            {
              type: 'column',
              attrs: { style: {} },
              content: [paragraph('Only')],
            },
          ],
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it('should reject an empty section', () => {
    const result = parseEmailDocument({
      type: 'doc',
      content: [{ type: 'section', attrs: { style: {} }, content: [] }],
    });

    expect(result.success).toBe(false);
  });

  it('should reject an image without src', () => {
    const result = parseEmailDocument({
      type: 'doc',
      content: [{ type: 'image', attrs: { alt: 'no source' } }],
    });

    expect(result.success).toBe(false);
  });

  it('should reject an invalid uploaded image file id', () => {
    const result = parseEmailDocument({
      type: 'doc',
      content: [
        {
          type: 'image',
          attrs: { fileId: 'not-a-uuid', src: 'https://example.com/a.png' },
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it('should reject non-document values', () => {
    expect(parseEmailDocument(null).success).toBe(false);
    expect(parseEmailDocument('a string').success).toBe(false);
    expect(parseEmailDocument({ type: 'paragraph' }).success).toBe(false);
  });
});

import { type EmailDocument } from '../email-document-schema';
import { EMAIL_DOCUMENT_SCHEMA_VERSION } from '../email-document-schema-version';
import { parseEmailBodyAsEmailDocument } from '../parse-email-body-as-email-document';

const htmlDocument = (html: string): EmailDocument => ({
  type: 'doc',
  attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
  content: [{ type: 'htmlDocument', attrs: { html } }],
});

describe('parseEmailBodyAsEmailDocument', () => {
  it('should keep the line breaks of plain text as editable lines', () => {
    expect(parseEmailBodyAsEmailDocument('Dear Ada,\r\n\r\nThanks')).toEqual({
      success: true,
      document: {
        type: 'doc',
        attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Dear Ada,' },
              { type: 'hardBreak' },
              { type: 'hardBreak' },
              { type: 'text', text: 'Thanks' },
            ],
          },
        ],
      },
    });
  });

  it('should keep plain text with variables as HTML so their values stay raw, with its line breaks', () => {
    expect(
      parseEmailBodyAsEmailDocument(
        "Dear {{person.name}} & {{step.['a&b']}},\r\n\r\nThanks",
      ),
    ).toEqual({
      success: true,
      document: htmlDocument(
        "Dear {{person.name}} &amp; {{step.['a&b']}},<br><br>Thanks",
      ),
    });
  });

  it('should keep a body with markup or made of a single variable as a verbatim HTML document', () => {
    const bodies = [
      '<p>Hello</p>',
      'Hi {{person.name}},<br><br>Thanks',
      '<!DOCTYPE html><html><head><style>p{color:red}</style></head><body>Hi</body></html>',
      'Tom &amp; Jerry',
      '<!-- tracking --> Hello',
      '<my-widget>Hi</my-widget>',
      'Hi <x-tag>Ada</x-tag>',
      'Total: <price>12</price>',
      'Thanks </foo>',
      ' {{code.html}}\n',
    ];

    for (const body of bodies) {
      expect(parseEmailBodyAsEmailDocument(body)).toEqual({
        success: true,
        document: htmlDocument(body),
      });
    }
  });

  it('should treat angle-bracketed words that are not HTML tags as plain text', () => {
    for (const body of ['Reach Bob <bob@acme.com>', 'Hi <John>']) {
      const result = parseEmailBodyAsEmailDocument(body);

      expect(result.success && result.document.content?.[0]?.type).toBe(
        'paragraph',
      );
    }

    expect(parseEmailBodyAsEmailDocument('<support> {{contact.name}}')).toEqual(
      {
        success: true,
        document: htmlDocument('&lt;support&gt; {{contact.name}}'),
      },
    );
  });

  it('should turn a blank body into an empty document', () => {
    expect(parseEmailBodyAsEmailDocument('  \n ')).toEqual({
      success: true,
      document: {
        type: 'doc',
        attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
        content: [],
      },
    });
  });

  it('should stamp the schema version on a serialized versionless document', () => {
    const content = [
      { type: 'paragraph', content: [{ type: 'text', text: 'Hi' }] },
    ];

    expect(
      parseEmailBodyAsEmailDocument(JSON.stringify({ type: 'doc', content })),
    ).toEqual({
      success: true,
      document: {
        type: 'doc',
        attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
        content,
      },
    });
  });

  it('should reject a document with a node outside the email schema', () => {
    const result = parseEmailBodyAsEmailDocument({
      type: 'doc',
      content: [{ type: 'taskList', content: [] }],
    });

    expect(result.success).toBe(false);
  });
});

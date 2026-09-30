import { type EmailDocument } from '../email-document-schema';
import { EMAIL_DOCUMENT_SCHEMA_VERSION } from '../email-document-schema-version';
import { getEmailDocumentStandaloneHtml } from '../get-email-document-standalone-html';
import { parseEmailBodyAsEmailDocument } from '../parse-email-body-as-email-document';

const htmlDocument = (html: string): EmailDocument => ({
  type: 'doc',
  attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
  content: [{ type: 'htmlDocument', attrs: { html } }],
});

describe('parseEmailBodyAsEmailDocument', () => {
  it('should keep line breaks and variables of a plain-text body', () => {
    expect(
      parseEmailBodyAsEmailDocument('Dear {{person.name}},\r\n\r\nThanks'),
    ).toEqual({
      success: true,
      document: {
        type: 'doc',
        attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Dear ' },
              { type: 'variableTag', attrs: { variable: '{{person.name}}' } },
              { type: 'text', text: ',' },
              { type: 'hardBreak' },
              { type: 'hardBreak' },
              { type: 'text', text: 'Thanks' },
            ],
          },
        ],
      },
    });
  });

  it('should keep a body with markup anywhere in it as a verbatim HTML document', () => {
    const bodies = [
      '<p>Hello</p>',
      'Hi {{person.name}},<br><br>Thanks',
      '<!DOCTYPE html><html><head><style>p{color:red}</style></head><body>Hi</body></html>',
      'Tom &amp; Jerry',
      '<!-- tracking --> Hello',
    ];

    for (const body of bodies) {
      expect(parseEmailBodyAsEmailDocument(body)).toEqual({
        success: true,
        document: htmlDocument(body),
      });
    }
  });

  it('should keep a body made of a single variable as a verbatim HTML document', () => {
    expect(parseEmailBodyAsEmailDocument(' {{code.html}}\n')).toEqual({
      success: true,
      document: htmlDocument(' {{code.html}}\n'),
    });
  });

  it('should treat angle-bracketed words that are not HTML tags as plain text', () => {
    for (const body of [
      'Reach Bob <bob@acme.com>',
      'Hi <John>',
      '<support> {{contact.name}}',
    ]) {
      const result = parseEmailBodyAsEmailDocument(body);

      expect(result.success && result.document.content?.[0]?.type).toBe(
        'paragraph',
      );
    }
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

  it('should reject an object that is not a document', () => {
    expect(parseEmailBodyAsEmailDocument({ html: '<p>Hi</p>' }).success).toBe(
      false,
    );
  });
});

describe('getEmailDocumentStandaloneHtml', () => {
  it('should return the HTML of a document made of one HTML document block', () => {
    expect(getEmailDocumentStandaloneHtml(htmlDocument('<p>Hi</p>'))).toBe(
      '<p>Hi</p>',
    );
  });

  it('should not treat an HTML document block mixed with other blocks as standalone', () => {
    expect(
      getEmailDocumentStandaloneHtml({
        type: 'doc',
        content: [
          { type: 'htmlDocument', attrs: { html: '<p>Hi</p>' } },
          { type: 'paragraph', content: [{ type: 'text', text: 'Bye' }] },
        ],
      }),
    ).toBeUndefined();
  });
});

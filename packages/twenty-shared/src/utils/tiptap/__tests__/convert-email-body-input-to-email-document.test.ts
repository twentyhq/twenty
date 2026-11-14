import { convertEmailBodyInputToEmailDocument } from '../convert-email-body-input-to-email-document';
import { EMAIL_DOCUMENT_SCHEMA_VERSION } from '../email-document-schema-version';

describe('convertEmailBodyInputToEmailDocument', () => {
  it('keeps the line breaks of a text body', () => {
    expect(
      convertEmailBodyInputToEmailDocument({
        type: 'text',
        text: 'Dear Ada,\r\n\r\n20 < 50 & {{literal}}',
      }),
    ).toEqual({
      type: 'doc',
      attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Dear Ada,' },
            { type: 'hardBreak' },
            { type: 'hardBreak' },
            { type: 'text', text: '20 < 50 & {{literal}}' },
          ],
        },
      ],
    });
  });

  it('sends an html body as written', () => {
    expect(
      convertEmailBodyInputToEmailDocument({
        type: 'html',
        html: 'Tom &amp; Jerry',
      }),
    ).toEqual({
      type: 'doc',
      attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
      content: [{ type: 'htmlDocument', attrs: { html: 'Tom &amp; Jerry' } }],
    });
  });

  it('stamps the schema version on a document without one', () => {
    const content = [
      { type: 'paragraph', content: [{ type: 'text', text: 'Hi' }] },
    ];

    expect(
      convertEmailBodyInputToEmailDocument({ type: 'doc', content }),
    ).toEqual({
      type: 'doc',
      attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
      content,
    });
  });
});

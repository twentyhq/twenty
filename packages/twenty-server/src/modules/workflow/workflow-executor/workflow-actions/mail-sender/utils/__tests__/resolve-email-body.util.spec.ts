import { EMAIL_DOCUMENT_SCHEMA_VERSION } from 'twenty-shared/utils';

import { resolveEmailBody } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/utils/resolve-email-body.util';

const htmlDocument = (html: string) => ({
  type: 'doc',
  attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
  content: [{ type: 'htmlDocument', attrs: { html } }],
});

describe('resolveEmailBody', () => {
  it('should resolve only authored placeholders in structured documents', () => {
    const body = JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Hello {{trigger.name}}: ' },
            {
              type: 'variableTag',
              attrs: { variable: '{{trigger.message}}' },
            },
          ],
        },
      ],
    });

    const resolvedBody = resolveEmailBody({
      body: body,
      context: {
        trigger: {
          name: 'Ada',
          message: '{{trigger.secret}}',
          secret: 'must remain private',
        },
      },
    });

    expect(resolvedBody.content?.[0]?.content).toEqual([
      { type: 'text', text: 'Hello Ada: ' },
      { type: 'text', text: '{{trigger.secret}}' },
    ]);
  });

  it('should preserve line breaks in resolved variable tags', () => {
    const body = JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'variableTag',
              attrs: { variable: '{{trigger.message}}' },
            },
          ],
        },
      ],
    });

    const resolvedBody = resolveEmailBody({
      body: body,
      context: {
        trigger: { message: 'first\n\nthird' },
      },
    });

    expect(resolvedBody.content?.[0]?.content).toEqual([
      { type: 'text', text: 'first' },
      { type: 'hardBreak' },
      { type: 'hardBreak' },
      { type: 'text', text: 'third' },
    ]);
  });

  it('should keep resolved HTML values escaped and inert', () => {
    const body = JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'html',
          attrs: { html: '<p>{{trigger.message}}</p>' },
        },
      ],
    });

    const resolvedBody = resolveEmailBody({
      body: body,
      context: {
        trigger: { message: '<b>{{trigger.secret}}</b>', secret: 'hidden' },
      },
    });

    expect(resolvedBody.content?.[0]?.attrs?.html).toBe(
      '<p>&lt;b&gt;{{trigger.secret}}&lt;/b&gt;</p>',
    );
  });

  it('should render the email document held by a whole-body variable', () => {
    const storedDocument = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'From a record' }],
        },
      ],
    };

    const resolvedBody = resolveEmailBody({
      body: JSON.stringify(htmlDocument('{{record.body}}')),
      context: { record: { body: JSON.stringify(storedDocument) } },
    });

    expect(resolvedBody).toEqual(storedDocument);
  });

  it('should send the HTML held by a whole-body variable as written', () => {
    const resolvedBody = resolveEmailBody({
      body: JSON.stringify(htmlDocument('{{code.body}}')),
      context: { code: { body: '<h1>Report</h1>' } },
    });

    expect(resolvedBody).toEqual(htmlDocument('<h1>Report</h1>'));
  });

  it('should reject a whole-body variable holding an invalid email document', () => {
    expect(() =>
      resolveEmailBody({
        body: JSON.stringify(htmlDocument('{{record.body}}')),
        context: {
          record: {
            body: JSON.stringify({ type: 'doc', content: [{ type: 'nope' }] }),
          },
        },
      }),
    ).toThrow('Invalid email document');
  });

  it.each([
    '',
    '<p>Hello {{trigger.name}}</p>',
    'Hi {{trigger.name}}',
    '{{code.body}}',
  ])(
    'should reject a body that is not a serialized email document: %s',
    (body) => {
      expect(() =>
        resolveEmailBody({
          body: body,
          context: { trigger: { name: 'Ada' }, code: {} },
        }),
      ).toThrow('Invalid email document');
    },
  );
});

import { EMAIL_DOCUMENT_SCHEMA_VERSION } from 'twenty-shared/utils';

import { resolveEmailBody } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/utils/resolve-email-body.util';

const htmlDocument = (html: string) => ({
  type: 'doc',
  attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
  content: [{ type: 'htmlDocument', attrs: { html } }],
});

describe('resolveEmailBody', () => {
  it('should resolve only authored placeholders in structured documents', async () => {
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

    const resolvedBody = await resolveEmailBody(body, {
      trigger: {
        name: 'Ada',
        message: '{{trigger.secret}}',
        secret: 'must remain private',
      },
    });

    expect(JSON.parse(resolvedBody).content[0].content).toEqual([
      { type: 'text', text: 'Hello Ada: ' },
      { type: 'text', text: '{{trigger.secret}}' },
    ]);
  });

  it('should preserve line breaks in resolved variable tags', async () => {
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

    const resolvedBody = await resolveEmailBody(body, {
      trigger: { message: 'first\n\nthird' },
    });

    expect(JSON.parse(resolvedBody).content[0].content).toEqual([
      { type: 'text', text: 'first' },
      { type: 'hardBreak' },
      { type: 'hardBreak' },
      { type: 'text', text: 'third' },
    ]);
  });

  it('should keep resolved HTML values escaped and inert', async () => {
    const body = JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'html',
          attrs: { html: '<p>{{trigger.message}}</p>' },
        },
      ],
    });

    const resolvedBody = await resolveEmailBody(body, {
      trigger: { message: '<b>{{trigger.secret}}</b>', secret: 'hidden' },
    });

    expect(JSON.parse(resolvedBody).content[0].attrs.html).toBe(
      '<p>&lt;b&gt;{{trigger.secret}}&lt;/b&gt;</p>',
    );
  });

  it('should inject raw values into a legacy HTML body kept as an HTML document', async () => {
    const resolvedBody = await resolveEmailBody(
      '<p>Hello {{trigger.name}}</p>',
      { trigger: { name: '<b>Ada</b>' } },
    );

    expect(JSON.parse(resolvedBody)).toEqual(
      htmlDocument('<p>Hello <b>Ada</b></p>'),
    );
  });

  it('should send the value of a single-variable body as HTML', async () => {
    const resolvedBody = await resolveEmailBody('{{code.body}}', {
      code: { body: '<h1>Report</h1>' },
    });

    expect(JSON.parse(resolvedBody)).toEqual(htmlDocument('<h1>Report</h1>'));
  });

  it('should render the email document held by a single-variable body', async () => {
    const storedDocument = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'From a record' }],
        },
      ],
    };

    const resolvedBody = await resolveEmailBody('{{record.body}}', {
      record: { body: JSON.stringify(storedDocument) },
    });

    expect(JSON.parse(resolvedBody)).toEqual(storedDocument);
  });

  it('should reject a single-variable body holding an invalid email document', async () => {
    await expect(
      resolveEmailBody('{{record.body}}', {
        record: {
          body: JSON.stringify({ type: 'doc', content: [{ type: 'nope' }] }),
        },
      }),
    ).rejects.toThrow('Invalid workflow email document');
  });

  it('should insert values raw into stored plain text and keep its line breaks', async () => {
    const resolvedBody = await resolveEmailBody(
      'Hi {{trigger.name}} & co\nBye',
      {
        trigger: { name: '<b>Ada</b>' },
      },
    );

    expect(JSON.parse(resolvedBody)).toEqual(
      htmlDocument('Hi <b>Ada</b> &amp; co<br>Bye'),
    );
  });
});

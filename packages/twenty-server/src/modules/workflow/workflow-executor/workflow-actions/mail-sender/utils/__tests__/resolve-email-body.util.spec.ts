import { resolveEmailBody } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/utils/resolve-email-body.util';

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

  it('should continue resolving legacy HTML bodies', async () => {
    await expect(
      resolveEmailBody('<p>Hello {{trigger.name}}</p>', {
        trigger: { name: 'Ada' },
      }),
    ).resolves.toBe('<p>Hello Ada</p>');
  });
});

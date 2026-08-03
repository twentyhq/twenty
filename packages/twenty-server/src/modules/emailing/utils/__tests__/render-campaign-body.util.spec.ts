import { renderCampaignBodyToHtml } from 'src/modules/emailing/utils/render-campaign-body.util';

jest.mock(
  'src/engine/core-modules/tool/tools/email-tool/utils/render-rich-text-to-html.util',
  () => ({
    renderRichTextToHtml: jest.fn().mockResolvedValue('<p>rendered html</p>'),
  }),
);

const { renderRichTextToHtml } = jest.requireMock(
  'src/engine/core-modules/tool/tools/email-tool/utils/render-rich-text-to-html.util',
);

const VARIABLES = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  fullName: 'Ada Lovelace',
  email: 'ada@example.com',
  personId: 'person-123',
};

const buildDocument = (text: string) =>
  JSON.stringify({
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  });

const renderedDocument = () => renderRichTextToHtml.mock.calls[0][0];

describe('renderCampaignBodyToHtml', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render a TipTap document through the email renderer', async () => {
    const html = await renderCampaignBodyToHtml(
      buildDocument('Hello there'),
      VARIABLES,
    );

    expect(html).toBe('<p>rendered html</p>');
    expect(renderedDocument()).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello there' }],
        },
      ],
    });
  });

  it('should substitute variables inside text nodes', async () => {
    await renderCampaignBodyToHtml(
      buildDocument('Hi {{firstName}}, from {{fullName}}'),
      VARIABLES,
    );

    expect(renderedDocument().content[0].content[0].text).toBe(
      'Hi Ada, from Ada Lovelace',
    );
  });

  it('should substitute variables carried by variable chip attributes', async () => {
    await renderCampaignBodyToHtml(
      JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Dear ' },
              { type: 'variableTag', attrs: { variable: '{{firstName}}' } },
            ],
          },
        ],
      }),
      VARIABLES,
    );

    expect(renderedDocument().content[0].content[1].attrs.variable).toBe('Ada');
  });

  it('should substitute variables inside button and link URLs', async () => {
    await renderCampaignBodyToHtml(
      JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'button',
            attrs: { href: 'https://example.com/p/{{personId}}' },
            content: [{ type: 'text', text: 'Open' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'here',
                marks: [
                  {
                    type: 'link',
                    attrs: { href: 'https://example.com/u/{{personId}}' },
                  },
                ],
              },
            ],
          },
        ],
      }),
      VARIABLES,
    );

    expect(renderedDocument().content[0].attrs.href).toBe(
      'https://example.com/p/person-123',
    );
    expect(renderedDocument().content[1].content[0].marks[0].attrs.href).toBe(
      'https://example.com/u/person-123',
    );
  });

  it('should substitute variables inside image link URLs', async () => {
    await renderCampaignBodyToHtml(
      JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'image',
            attrs: {
              src: 'https://example.com/banner.png',
              href: 'https://example.com/promo/{{personId}}',
            },
          },
        ],
      }),
      VARIABLES,
    );

    expect(renderedDocument().content[0].attrs.href).toBe(
      'https://example.com/promo/person-123',
    );
  });

  it('should substitute variables inside raw HTML blocks with escaping', async () => {
    await renderCampaignBodyToHtml(
      JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'html',
            attrs: {
              html: '<a href="https://example.com/p/{{personId}}">Hi {{firstName}}</a>',
            },
          },
        ],
      }),
      { ...VARIABLES, firstName: '<b>Ada</b>' },
    );

    expect(renderedDocument().content[0].attrs.html).toBe(
      '<a href="https://example.com/p/person-123">Hi &lt;b&gt;Ada&lt;/b&gt;</a>',
    );
  });

  it('should substitute variables nested under marks and lists', async () => {
    const document = JSON.stringify({
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
                  content: [
                    {
                      type: 'text',
                      text: 'Dear {{firstName}}',
                      marks: [{ type: 'bold' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    await renderCampaignBodyToHtml(document, VARIABLES);

    const textNode =
      renderedDocument().content[0].content[0].content[0].content[0];

    expect(textNode.text).toBe('Dear Ada');
    expect(textNode.marks).toEqual([{ type: 'bold' }]);
  });

  it('should replace unknown variables with an empty string', async () => {
    await renderCampaignBodyToHtml(buildDocument('Hi {{unknown}}!'), VARIABLES);

    expect(renderedDocument().content[0].content[0].text).toBe('Hi !');
  });

  it('should leave a value containing markup for the renderer to escape', async () => {
    await renderCampaignBodyToHtml(buildDocument('{{firstName}}'), {
      ...VARIABLES,
      firstName: '<script>alert(1)</script>',
    });

    expect(renderedDocument().content[0].content[0].text).toBe(
      '<script>alert(1)</script>',
    );
  });

  it('should keep placeholders in place when no variables are given', async () => {
    await renderCampaignBodyToHtml(buildDocument('Hi {{firstName}}'), null);

    expect(renderedDocument().content[0].content[0].text).toBe(
      'Hi {{firstName}}',
    );
  });

  it('should render an empty body as empty without calling the renderer', async () => {
    expect(await renderCampaignBodyToHtml('', VARIABLES)).toBe('');
    expect(await renderCampaignBodyToHtml('   ', VARIABLES)).toBe('');
    expect(renderRichTextToHtml).not.toHaveBeenCalled();
  });

  it('should reject a body that is not JSON', async () => {
    await expect(
      renderCampaignBodyToHtml('<p>Hi {{firstName}}</p>', VARIABLES),
    ).rejects.toThrow('not a renderable email document');
  });

  it('should reject a JSON value that is not a document', async () => {
    await expect(
      renderCampaignBodyToHtml('{"foo":"bar"}', VARIABLES),
    ).rejects.toThrow('not a renderable email document');
  });

  it('should reject a document with a non-array content', async () => {
    await expect(
      renderCampaignBodyToHtml(
        '{"type":"doc","content":"not an array"}',
        VARIABLES,
      ),
    ).rejects.toThrow('not a renderable email document');
  });

  it('should render a document with no content at all', async () => {
    const html = await renderCampaignBodyToHtml('{"type":"doc"}', VARIABLES);

    expect(html).toBe('<p>rendered html</p>');
    expect(renderedDocument()).toEqual({ type: 'doc' });
  });
});

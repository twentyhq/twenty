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

  it('should interpolate legacy html bodies without rendering them again', async () => {
    const html = await renderCampaignBodyToHtml(
      '<p>Hi {{firstName}}</p>',
      VARIABLES,
    );

    expect(html).toBe('<p>Hi Ada</p>');
    expect(renderRichTextToHtml).not.toHaveBeenCalled();
  });

  it('should escape values interpolated into legacy html bodies', async () => {
    const html = await renderCampaignBodyToHtml('<p>{{firstName}}</p>', {
      ...VARIABLES,
      firstName: '<script>alert(1)</script>',
    });

    expect(html).not.toContain('<script>');
  });

  it('should return a legacy html body untouched when no variables are given', async () => {
    const body = '<p>Hi {{firstName}}</p>';

    expect(await renderCampaignBodyToHtml(body, null)).toBe(body);
    expect(renderRichTextToHtml).not.toHaveBeenCalled();
  });

  it('should treat an empty body as a legacy body', async () => {
    expect(await renderCampaignBodyToHtml('', VARIABLES)).toBe('');
    expect(renderRichTextToHtml).not.toHaveBeenCalled();
  });

  it('should treat a JSON value that is not a document as a legacy body', async () => {
    const body = '{"foo":"bar"}';

    expect(await renderCampaignBodyToHtml(body, VARIABLES)).toBe(body);
    expect(renderRichTextToHtml).not.toHaveBeenCalled();
  });

  it('should treat a document with a non-array content as a legacy body', async () => {
    const body = '{"type":"doc","content":"not an array"}';

    expect(await renderCampaignBodyToHtml(body, VARIABLES)).toBe(body);
    expect(renderRichTextToHtml).not.toHaveBeenCalled();
  });

  it('should render a document with no content at all', async () => {
    await renderCampaignBodyToHtml('{"type":"doc"}', VARIABLES);

    expect(renderedDocument()).toEqual({ type: 'doc' });
  });
});

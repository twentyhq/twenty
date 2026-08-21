import { EMAIL_DOCUMENT_SCHEMA_VERSION } from 'twenty-shared/utils';

import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { compileCampaignEmailContent } from 'src/modules/emailing/utils/compile-campaign-email-content.util';

jest.mock(
  'src/engine/core-modules/email/utils/compile-outbound-email-content.util',
  () => ({
    compileOutboundEmailContent: jest.fn().mockResolvedValue({
      html: '<p>rendered html</p>',
      plainText: 'rendered html',
    }),
  }),
);

const { compileOutboundEmailContent } = jest.requireMock(
  'src/engine/core-modules/email/utils/compile-outbound-email-content.util',
);

const VARIABLES = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  fullName: 'Ada Lovelace',
  email: 'ada@example.com',
  personId: 'person-123',
};

const serializeDocument = (content?: unknown[]) =>
  JSON.stringify({
    type: 'doc',
    attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
    ...(content === undefined ? {} : { content }),
  });

const buildDocument = (text: string) =>
  serializeDocument([{ type: 'paragraph', content: [{ type: 'text', text }] }]);

const compiledDocument = () => compileOutboundEmailContent.mock.calls[0][0];

describe('compileCampaignEmailContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render a TipTap document through the email renderer', async () => {
    const content = await compileCampaignEmailContent(
      buildDocument('Hello there'),
      VARIABLES,
    );

    expect(content).toEqual({
      html: '<p>rendered html</p>',
      plainText: 'rendered html',
    });
    expect(compiledDocument()).toEqual({
      type: 'doc',
      attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello there' }],
        },
      ],
    });
  });

  it('should substitute variables inside text nodes', async () => {
    await compileCampaignEmailContent(
      buildDocument('Hi {{firstName}}, from {{fullName}}'),
      VARIABLES,
    );

    expect(compiledDocument().content[0].content[0].text).toBe(
      'Hi Ada, from Ada Lovelace',
    );
  });

  it('should substitute variables carried by variable chip attributes', async () => {
    await compileCampaignEmailContent(
      serializeDocument([
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Dear ' },
            { type: 'variableTag', attrs: { variable: '{{firstName}}' } },
          ],
        },
      ]),
      VARIABLES,
    );

    expect(compiledDocument().content[0].content[1]).toEqual({
      type: 'text',
      text: 'Ada',
    });
  });

  it('should substitute variables inside button and link URLs', async () => {
    await compileCampaignEmailContent(
      serializeDocument([
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
      ]),
      VARIABLES,
    );

    expect(compiledDocument().content[0].attrs.href).toBe(
      'https://example.com/p/person-123',
    );
    expect(compiledDocument().content[1].content[0].marks[0].attrs.href).toBe(
      'https://example.com/u/person-123',
    );
  });

  it('should substitute variables inside image link URLs', async () => {
    await compileCampaignEmailContent(
      serializeDocument([
        {
          type: 'image',
          attrs: {
            src: 'https://example.com/{{personId}}/banner.png',
            href: 'https://example.com/promo/{{personId}}',
            alt: 'Banner for {{firstName}}',
          },
        },
      ]),
      VARIABLES,
    );

    expect(compiledDocument().content[0].attrs.href).toBe(
      'https://example.com/promo/person-123',
    );
    expect(compiledDocument().content[0].attrs.src).toBe(
      'https://example.com/person-123/banner.png',
    );
    expect(compiledDocument().content[0].attrs.alt).toBe('Banner for Ada');
  });

  it('should substitute variables inside raw HTML blocks with escaping', async () => {
    await compileCampaignEmailContent(
      serializeDocument([
        {
          type: 'html',
          attrs: {
            html: '<a href="https://example.com/p/{{personId}}">Hi {{firstName}}</a>',
          },
        },
      ]),
      { ...VARIABLES, firstName: '<b>Ada</b>' },
    );

    expect(compiledDocument().content[0].attrs.html).toBe(
      '<a href="https://example.com/p/person-123">Hi &lt;b&gt;Ada&lt;/b&gt;</a>',
    );
  });

  it('should substitute variables nested under marks and lists', async () => {
    const document = serializeDocument([
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
    ]);

    await compileCampaignEmailContent(document, VARIABLES);

    const textNode =
      compiledDocument().content[0].content[0].content[0].content[0];

    expect(textNode.text).toBe('Dear Ada');
    expect(textNode.marks).toEqual([{ type: 'bold' }]);
  });

  it('should replace unknown variables with an empty string', async () => {
    await compileCampaignEmailContent(
      buildDocument('Hi {{unknown}}!'),
      VARIABLES,
    );

    expect(compiledDocument().content[0].content[0].text).toBe('Hi !');
  });

  it('should leave a value containing markup for the renderer to escape', async () => {
    await compileCampaignEmailContent(buildDocument('{{firstName}}'), {
      ...VARIABLES,
      firstName: '<script>alert(1)</script>',
    });

    expect(compiledDocument().content[0].content[0].text).toBe(
      '<script>alert(1)</script>',
    );
  });

  it('should keep placeholders in place when no variables are given', async () => {
    await compileCampaignEmailContent(buildDocument('Hi {{firstName}}'), null);

    expect(compiledDocument().content[0].content[0].text).toBe(
      'Hi {{firstName}}',
    );
  });

  it('should render an empty body as empty without calling the renderer', async () => {
    expect(await compileCampaignEmailContent('', VARIABLES)).toEqual({
      html: '',
      plainText: '',
    });
    expect(await compileCampaignEmailContent('   ', VARIABLES)).toEqual({
      html: '',
      plainText: '',
    });
    expect(compileOutboundEmailContent).not.toHaveBeenCalled();
  });

  it('should reject a body that is not JSON', async () => {
    await expect(
      compileCampaignEmailContent('<p>Hi {{firstName}}</p>', VARIABLES),
    ).rejects.toThrow('not a renderable email document');
  });

  it('should reject a JSON value that is not a document', async () => {
    await expect(
      compileCampaignEmailContent('{"foo":"bar"}', VARIABLES),
    ).rejects.toMatchObject({
      code: EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE,
    });

    await expect(
      compileCampaignEmailContent('{"foo":"bar"}', VARIABLES),
    ).rejects.toBeInstanceOf(EmailingDomainException);
  });

  it('should reject a document with a non-array content', async () => {
    await expect(
      compileCampaignEmailContent(
        JSON.stringify({
          type: 'doc',
          attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
          content: 'not an array',
        }),
        VARIABLES,
      ),
    ).rejects.toThrow('not a renderable email document');
  });

  it('should render a document with no content at all', async () => {
    const content = await compileCampaignEmailContent(
      serializeDocument(),
      VARIABLES,
    );

    expect(content.html).toBe('<p>rendered html</p>');
    expect(compiledDocument()).toEqual({
      type: 'doc',
      attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
    });
  });

  it('should reject a versionless document', async () => {
    await expect(
      compileCampaignEmailContent(
        JSON.stringify({ type: 'doc', content: [] }),
        VARIABLES,
      ),
    ).rejects.toThrow('not a renderable email document');
  });
});

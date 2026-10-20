import { EMAIL_DOCUMENT_SCHEMA_VERSION } from 'twenty-shared/utils';

import { applyReplacementTags } from 'src/engine/core-modules/emailing-domain/utils/apply-replacement-tags.util';
import { buildCampaignBatchReplacements } from 'src/modules/emailing/utils/build-campaign-batch-replacements.util';
import { compileCampaignBatchTemplate } from 'src/modules/emailing/utils/compile-campaign-batch-template.util';

const serializeDocument = (content: unknown[]): string =>
  JSON.stringify({
    type: 'doc',
    attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
    content,
  });

const paragraphDocument = (text: string): string =>
  serializeDocument([{ type: 'paragraph', content: [{ type: 'text', text }] }]);

const deliverToRecipient = async ({
  subjectTemplate = 'Newsletter',
  bodyTemplate,
  variables,
}: {
  subjectTemplate?: string;
  bodyTemplate: string;
  variables: Record<string, string>;
}) => {
  const { template, campaignVariables } = await compileCampaignBatchTemplate({
    subjectTemplate,
    bodyTemplate,
  });
  const replacements = buildCampaignBatchReplacements({
    campaignVariables,
    variables,
  });

  return {
    campaignVariables,
    subject: applyReplacementTags(template.subject, replacements),
    html: applyReplacementTags(template.html ?? '', replacements),
    text: applyReplacementTags(template.text, replacements),
  };
};

describe('compileCampaignBatchTemplate', () => {
  beforeAll(() => {
    jest.useRealTimers();
  });

  it('escapes a body variable in the html email while leaving it raw in the plain text email', async () => {
    const { html, text } = await deliverToRecipient({
      bodyTemplate: paragraphDocument('Hi {{firstName}}, welcome.'),
      variables: { firstName: '<img src=x onerror=alert(1)>' },
    });

    expect(html).toContain('Hi &lt;img src=x onerror=alert(1)&gt;, welcome.');
    expect(html).not.toContain('onerror=alert(1)>');
    expect(text).toContain('Hi <img src=x onerror=alert(1)>, welcome.');
  });

  it('keeps a variable used inside a link href from breaking out of the attribute', async () => {
    const { html } = await deliverToRecipient({
      bodyTemplate: serializeDocument([
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Read more',
              marks: [
                {
                  type: 'link',
                  attrs: { href: 'https://example.com/u/{{token}}' },
                },
              ],
            },
          ],
        },
      ]),
      variables: { token: '" onmouseover="alert(1)' },
    });

    expect(html).toContain(
      'href="https://example.com/u/%22%20onmouseover%3D%22alert(1)"',
    );
    expect(html).not.toContain('onmouseover="');
  });

  it('neutralises a javascript scheme carried by a variable bound as a whole href', async () => {
    const { html } = await deliverToRecipient({
      bodyTemplate: serializeDocument([
        {
          type: 'button',
          attrs: { href: '{{website}}', style: {} },
          content: [{ type: 'text', text: 'Open' }],
        },
      ]),
      variables: { website: 'javascript:alert(1)' },
    });

    expect(html).toContain('Open');
    expect(html).not.toContain('javascript:');
  });

  it('gives a variable used twice a single slot and the same value in both bodies', async () => {
    const { campaignVariables, html, text } = await deliverToRecipient({
      bodyTemplate: paragraphDocument(
        '{{firstName}} {{lastName}}, this is for {{firstName}}.',
      ),
      variables: { firstName: 'Ada', lastName: 'Lovelace' },
    });

    expect(campaignVariables).toEqual([
      { name: 'firstName' },
      { name: 'lastName' },
    ]);
    expect(html).toContain('Ada Lovelace, this is for Ada.');
    expect(text).toContain('Ada Lovelace, this is for Ada.');
  });

  it('personalises the subject of a campaign that has no body at all', async () => {
    for (const bodyTemplate of ['', '   ']) {
      const { subject, html, text } = await deliverToRecipient({
        subjectTemplate: 'Hi {{firstName}}, a word',
        bodyTemplate,
        variables: { firstName: '<b>Ada</b>' },
      });

      expect(subject).toBe('Hi <b>Ada</b>, a word');
      expect(html).toBe('');
      expect(text).toBe('');
    }
  });

  it('renders the fallback for a recipient with an empty value in subject, html and text', async () => {
    const { subject, html, text } = await deliverToRecipient({
      subjectTemplate: 'Hi {{jobTitle | default: "there"}}',
      bodyTemplate: serializeDocument([
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Hello ' },
            {
              type: 'variableTag',
              attrs: { variable: '{{jobTitle | default: "<b>R&D</b>"}}' },
            },
          ],
        },
      ]),
      variables: { jobTitle: ' ' },
    });

    expect(subject).toBe('Hi there');
    expect(html).toContain('Hello &lt;b&gt;R&amp;D&lt;/b&gt;');
    expect(text).toContain('Hello <b>R&D</b>');
  });

  it('renders a variable with and without a fallback independently', async () => {
    const { html } = await deliverToRecipient({
      bodyTemplate: paragraphDocument(
        '[{{jobTitle}}] [{{ jobTitle | default: "there" }}] [{{jobTitle|default:"there"}}]',
      ),
      variables: {},
    });

    expect(html).toContain('[] [there] [there]');
  });

  it('percent-encodes a fallback used inside a link href', async () => {
    const { html } = await deliverToRecipient({
      bodyTemplate: serializeDocument([
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Read more',
              marks: [
                {
                  type: 'link',
                  attrs: {
                    href: 'https://example.com/?city={{city | default: "New York & co"}}',
                  },
                },
              ],
            },
          ],
        },
      ]),
      variables: { city: '' },
    });

    expect(html).toContain(
      'href="https://example.com/?city=New%20York%20%26%20co"',
    );
  });
});

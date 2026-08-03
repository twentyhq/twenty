import { collectCampaignVariableNames } from 'src/modules/emailing/utils/collect-campaign-variables.util';

describe('collectCampaignVariableNames', () => {
  it('should collect variables from every substitution site', () => {
    const document = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Hello {{firstName}}' },
            { type: 'variableTag', attrs: { variable: '{{lastName}}' } },
            {
              type: 'text',
              text: 'link',
              marks: [
                {
                  type: 'link',
                  attrs: { href: 'https://example.com/{{personId}}' },
                },
              ],
            },
          ],
        },
        {
          type: 'button',
          attrs: { href: 'https://example.com/?email={{email}}', style: '' },
          content: [{ type: 'text', text: 'Open' }],
        },
        {
          type: 'section',
          attrs: { style: '' },
          content: [
            {
              type: 'html',
              attrs: { html: '<p>{{fullName}}</p>' },
            },
          ],
        },
      ],
    };

    expect([...collectCampaignVariableNames(document)].sort()).toEqual([
      'email',
      'firstName',
      'fullName',
      'lastName',
      'personId',
    ]);
  });

  it('should collect nothing from a document without variables', () => {
    expect(
      collectCampaignVariableNames({
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'Hi' }] },
        ],
      }).size,
    ).toBe(0);
  });

  it('should deduplicate repeated variables', () => {
    expect([
      ...collectCampaignVariableNames({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: '{{firstName}} and {{ firstName }}' },
            ],
          },
        ],
      }),
    ]).toEqual(['firstName']);
  });
});

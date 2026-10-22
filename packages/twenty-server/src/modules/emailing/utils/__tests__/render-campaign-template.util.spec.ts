import { renderCampaignTemplate } from 'src/modules/emailing/utils/render-campaign-template.util';

describe('renderCampaignTemplate', () => {
  it('renders a plain variable exactly as before, blank when the value is empty', () => {
    expect(
      renderCampaignTemplate(
        'Hi {{jobTitle}} for {{ city }}',
        { jobTitle: 'CTO', city: '' },
        { escapeValues: false },
      ),
    ).toBe('Hi CTO for ');
  });

  it('renders the fallback when the value is only whitespace', () => {
    expect(
      renderCampaignTemplate(
        'Hi {{jobTitle | default: "there"}}',
        { jobTitle: ' \t ' },
        { escapeValues: false },
      ),
    ).toBe('Hi there');
  });

  it('renders the value instead of the fallback when the value is set', () => {
    expect(
      renderCampaignTemplate(
        'Hi {{ jobTitle|default:"there" }}',
        { jobTitle: ' CTO ' },
        { escapeValues: false },
      ),
    ).toBe('Hi  CTO ');
  });

  it('escapes the fallback like a value', () => {
    expect(
      renderCampaignTemplate(
        '<p>{{jobTitle | default: "<script>alert(\'x\')</script> & co"}}</p>',
        {},
        { escapeValues: true },
      ),
    ).toBe('<p>&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt; &amp; co</p>');
  });
});

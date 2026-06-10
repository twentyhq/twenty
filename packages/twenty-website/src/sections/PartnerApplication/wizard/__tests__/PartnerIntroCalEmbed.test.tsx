// __tests__/PartnerIntroCalEmbed.test.tsx
import { renderToStaticMarkup } from 'react-dom/server';

jest.mock('@calcom/embed-react', () => ({
  __esModule: true,
  default: (props: {
    calLink: string;
    config?: {
      theme?: string;
      layout?: string;
      name?: string;
      email?: string;
      notes?: string;
    };
  }) => (
    <div
      data-testid="cal-embed"
      data-callink={props.calLink}
      data-theme={props.config?.theme}
      data-layout={props.config?.layout}
      data-name={props.config?.name}
      data-email={props.config?.email}
      data-notes={props.config?.notes}
    />
  ),
  getCalApi: jest.fn(async () => jest.fn()),
}));

import { PartnerIntroCalEmbed } from '@/sections/PartnerApplication/wizard/PartnerIntroCalEmbed';

describe('PartnerIntroCalEmbed', () => {
  it('points at the partner-intro Cal link and forwards prefill + theme', () => {
    const html = renderToStaticMarkup(
      <PartnerIntroCalEmbed
        name="Ada Lovelace"
        email="ada@example.com"
        notes="Company: Acme"
      />,
    );

    expect(html).toContain('data-callink="rashad-twenty/partner-intro"');
    expect(html).toContain('data-theme="dark"');
    expect(html).toContain('data-layout="month_view"');
    expect(html).toContain('data-name="Ada Lovelace"');
    expect(html).toContain('data-email="ada@example.com"');
    expect(html).toContain('data-notes="Company: Acme"');
  });
});

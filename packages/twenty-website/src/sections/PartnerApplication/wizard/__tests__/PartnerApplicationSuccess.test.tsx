// __tests__/PartnerApplicationSuccess.test.tsx
import { renderToStaticMarkup } from 'react-dom/server';

jest.mock('@calcom/embed-react', () => ({
  __esModule: true,
  default: (props: {
    calLink: string;
    config?: { name?: string; email?: string; notes?: string };
  }) => (
    <div
      data-testid="cal-embed"
      data-callink={props.calLink}
      data-name={props.config?.name}
      data-notes={props.config?.notes}
    />
  ),
}));

import { PartnerApplicationSuccess } from '@/sections/PartnerApplication/wizard/PartnerApplicationSuccess';

const PassthroughTitle = ({ render }: { render?: React.ReactElement }) => (
  <>{render}</>
);

describe('PartnerApplicationSuccess', () => {
  it('renders the booking embed prefilled from the applicant plus an escape hatch', () => {
    const html = renderToStaticMarkup(
      <PartnerApplicationSuccess
        Title={PassthroughTitle}
        titleSerif="Thanks, you are in."
        titleSans="Now book your intro call."
        subtitle="Grab 30 minutes so we can get to know your team."
        bookLaterLabel="book later"
        name="Ada Lovelace"
        email="ada@example.com"
        company="Analytical Engines"
        onDismiss={() => undefined}
      />,
    );

    expect(html).toContain('data-callink="rashad-twenty/partner-intro"');
    expect(html).toContain('data-name="Ada Lovelace"');
    expect(html).toContain('data-notes="Company: Analytical Engines"');
    expect(html).toContain('Now book your intro call.');
    expect(html).toContain('book later');
  });
});

import { renderToStaticMarkup } from 'react-dom/server';

import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { PartnerProfileCtas } from '../components/PartnerProfileCtas';

beforeAll(() => {
  i18n.load(SOURCE_LOCALE, {});
  i18n.activate(SOURCE_LOCALE);
});

const render = (props: {
  partnerName: string;
  calendarLink: string;
  linkedinUrl: string;
}) =>
  renderToStaticMarkup(
    <I18nProvider i18n={i18n}>
      <PartnerProfileCtas
        partnerName={props.partnerName}
        calendarLink={props.calendarLink}
        linkedinUrl={props.linkedinUrl}
      />
    </I18nProvider>,
  );

describe('PartnerProfileCtas', () => {
  it('shows Book a call (and no Contact) when a calendar link is present', () => {
    const html = render({
      partnerName: 'Test Partner',
      calendarLink: 'https://calendly.com/test-partner',
      linkedinUrl: '',
    });
    expect(html).toContain('Book a call');
    expect(html).not.toContain('Contact Test Partner');
  });

  it('keeps the calendar CTA over Contact even when LinkedIn is present', () => {
    const html = render({
      partnerName: 'Test Partner',
      calendarLink: 'https://calendly.com/test-partner',
      linkedinUrl: 'https://www.linkedin.com/in/test',
    });
    expect(html).toContain('Book a call');
    expect(html).toContain('View on LinkedIn');
    expect(html).not.toContain('Contact Test Partner');
  });

  it('shows Contact alongside LinkedIn when there is no booking link', () => {
    const html = render({
      partnerName: 'Test Partner',
      calendarLink: '',
      linkedinUrl: 'https://www.linkedin.com/in/test',
    });
    expect(html).toContain('View on LinkedIn');
    expect(html).toContain('Contact Test Partner');
    expect(html).not.toContain('Book a call');
  });

  it('falls back to a Contact mailto when there is no booking link', () => {
    const html = render({
      partnerName: 'Test Partner',
      calendarLink: '',
      linkedinUrl: '',
    });
    // Label names the partner, not a generic "partner".
    expect(html).toContain('Contact Test Partner');
    expect(html).toContain('mailto:rashad@twenty.com');
    // Subject references the partner; body carries the pre-filled prompt.
    // (Apostrophes are HTML-attribute-escaped in the rendered href, so assert
    // on apostrophe-free fragments of the URL-encoded text.)
    expect(html).toContain(
      encodeURIComponent('Interested in meeting Test Partner'),
    );
    expect(html).toContain(encodeURIComponent('interested in meeting. '));
    expect(html).toContain(encodeURIComponent('my project:'));
    // Two trailing blank lines leave room to paste the project.
    expect(html).toContain('%0A%0A');
  });

  it('treats unsafe calendar/linkedin values as missing', () => {
    const html = render({
      partnerName: 'Test Partner',
      calendarLink: 'javascript:alert(1)',
      linkedinUrl: 'not-a-url',
    });
    expect(html).toContain('Contact Test Partner');
    expect(html).not.toContain('Book a call');
    expect(html).not.toContain('View on LinkedIn');
  });
});

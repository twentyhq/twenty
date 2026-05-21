import { renderToStaticMarkup } from 'react-dom/server';

import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import type { MarketplacePartner } from '@/lib/partners-api';
import { PartnerCard } from '../components/PartnerCard';

beforeAll(() => {
  i18n.load(SOURCE_LOCALE, {});
  i18n.activate(SOURCE_LOCALE);
});

const FIXTURE: MarketplacePartner = {
  slug: 'test-partner',
  name: 'Test Partner',
  introduction: 'A reliable partner for testing purposes.',
  calendarLink: 'https://calendly.com/test-partner',
  deploymentExpertise: ['CLOUD', 'SELF_HOST'],
  region: ['EUROPE', 'US'],
  languagesSpoken: ['ENGLISH', 'FRENCH'],
};

const renderCard = () =>
  renderToStaticMarkup(
    <I18nProvider i18n={i18n}>
      <PartnerCard partner={FIXTURE} index={0} />
    </I18nProvider>,
  );

describe('PartnerCard', () => {
  it('renders the partner name as the article heading', () => {
    const html = renderCard();
    expect(html).toMatch(new RegExp(`<h3[^>]*>${FIXTURE.name}</h3>`, 'i'));
  });

  it('renders the geo eyebrow with the first served region', () => {
    const html = renderCard();
    expect(html).toContain(FIXTURE.region[0]);
  });

  it('renders the full introduction text', () => {
    const html = renderCard();
    expect(html).toContain(FIXTURE.introduction);
  });

  it('renders one chip per value across the three chip rows', () => {
    const html = renderCard();
    const expectedChipCount =
      FIXTURE.region.length +
      FIXTURE.languagesSpoken.length +
      FIXTURE.deploymentExpertise.length;
    const liMatches = html.match(/<li[^>]*>/g) ?? [];
    expect(liMatches.length).toBe(expectedChipCount);
  });

  it('renders the Calendly CTA pointing at the partner link in a new tab', () => {
    const html = renderCard();
    expect(html).toContain(`href="${FIXTURE.calendarLink}"`);
    expect(html).toContain('target="_blank"');
    expect(html).toContain('noopener');
  });

  it.each([
    'javascript:alert(document.cookie)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    '',
    'not-a-url',
  ])('suppresses the CTA when calendarLink is %s', (unsafeLink) => {
    const html = renderToStaticMarkup(
      <I18nProvider i18n={i18n}>
        <PartnerCard
          partner={{ ...FIXTURE, calendarLink: unsafeLink }}
          index={0}
        />
      </I18nProvider>,
    );
    expect(html).not.toContain('href=');
  });
});

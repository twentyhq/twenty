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
  partnerScope: ['HOSTING', 'DEVELOPMENT'],
  region: ['EUROPE', 'US'],
  languagesSpoken: ['ENGLISH', 'FRENCH'],
  hourlyRateUsd: null,
  projectBudgetMinUsd: null,
  projectBudgetTypicalUsd: null,
  linkedinUrl: '',
  profilePictureUrl: '',
  city: '',
  country: '',
  skills: [],
};

const renderCard = () =>
  renderToStaticMarkup(
    <I18nProvider i18n={i18n}>
      <PartnerCard partner={FIXTURE} index={0} locale="en" />
    </I18nProvider>,
  );

describe('PartnerCard', () => {
  it('renders the partner name inside the detail-page link in the heading', () => {
    const html = renderCard();
    expect(html).toMatch(
      new RegExp(`<h3[^>]*>\\s*<a[^>]*>${FIXTURE.name}</a>\\s*</h3>`, 'i'),
    );
    expect(html).toContain(`href="/en/partners/profile/${FIXTURE.slug}"`);
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
      FIXTURE.partnerScope.length;
    const liMatches = html.match(/<li[^>]*>/g) ?? [];
    expect(liMatches.length).toBe(expectedChipCount);
  });

  it('renders a View profile CTA pointing at the partner profile page', () => {
    const html = renderCard();
    expect(html).toContain('View profile');
    expect(html).toContain(`href="/en/partners/profile/${FIXTURE.slug}"`);
  });

  it.each(['https://calendly.com/test-partner', '', 'not-a-url'])(
    'renders the View profile CTA regardless of calendarLink (%s)',
    (link) => {
      const html = renderToStaticMarkup(
        <I18nProvider i18n={i18n}>
          <PartnerCard
            partner={{ ...FIXTURE, calendarLink: link }}
            index={0}
            locale="en"
          />
        </I18nProvider>,
      );
      expect(html).toContain('View profile');
      expect(html).toContain(`href="/en/partners/profile/${FIXTURE.slug}"`);
    },
  );
});

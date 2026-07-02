import { EMPTY_FILTER_CRITERIA, type FilterCriteria } from './filter-criteria';
import { filterPartners } from './filter-partners';
import { hasAnyFilter } from './has-any-filter';
import { type MarketplacePartner } from './marketplace-partner';

const partner = (
  overrides: Partial<MarketplacePartner>,
): MarketplacePartner => ({
  slug: 'p',
  name: 'P',
  description: '',
  calendarLink: '',
  partnerScope: [],
  region: [],
  languagesSpoken: [],
  hourlyRateUsd: null,
  projectBudgetMinUsd: null,
  links: {
    website: null,
    linkedin: null,
    x: null,
    github: null,
  },
  profilePictureUrl: '',
  city: '',
  country: '',
  skills: [],
  services: [],
  portfolio: [],
  clients: [],
  ...overrides,
});

const europeDev = partner({
  slug: 'eu',
  region: ['EUROPE'],
  partnerScope: ['DEVELOPMENT'],
  languagesSpoken: ['FRENCH'],
});
const usAdvisory = partner({
  slug: 'us',
  region: ['US'],
  partnerScope: ['ADVISORY'],
  languagesSpoken: ['ENGLISH'],
});
const partners = [europeDev, usAdvisory];

describe('filterPartners', () => {
  it('returns every partner when no facet is selected', () => {
    expect(filterPartners(partners, EMPTY_FILTER_CRITERIA)).toEqual(partners);
  });

  it('keeps only partners matching a selected region', () => {
    const criteria: FilterCriteria = {
      ...EMPTY_FILTER_CRITERIA,
      regions: new Set(['EUROPE']),
    };
    expect(filterPartners(partners, criteria)).toEqual([europeDev]);
  });

  it('ANDs across facets (region AND language)', () => {
    const criteria: FilterCriteria = {
      regions: new Set(['EUROPE']),
      languages: new Set(['ENGLISH']),
      categories: new Set(),
    };
    expect(filterPartners(partners, criteria)).toEqual([]);
  });

  it('ORs within a facet (either region)', () => {
    const criteria: FilterCriteria = {
      ...EMPTY_FILTER_CRITERIA,
      regions: new Set(['EUROPE', 'US']),
    };
    expect(filterPartners(partners, criteria)).toEqual(partners);
  });
});

describe('hasAnyFilter', () => {
  it('is false for empty criteria', () => {
    expect(hasAnyFilter(EMPTY_FILTER_CRITERIA)).toBe(false);
  });

  it('is true once a facet has a selection', () => {
    expect(
      hasAnyFilter({
        ...EMPTY_FILTER_CRITERIA,
        categories: new Set(['HOSTING']),
      }),
    ).toBe(true);
  });
});

import type { MarketplacePartner } from '@/lib/partners-api';

import {
  EMPTY_CRITERIA,
  filterPartners,
  hasAnyFilter,
  type FilterCriteria,
} from '../filter-partners';

const make = (overrides: Partial<MarketplacePartner>): MarketplacePartner => ({
  slug: 'p',
  name: 'Partner',
  introduction: 'intro',
  calendarLink: 'https://calendly.com/p',
  region: [],
  languagesSpoken: [],
  partnerScope: [],
  hourlyRateUsd: null,
  projectBudgetMinUsd: null,
  projectBudgetTypicalUsd: null,
  linkedinUrl: '',
  profilePictureUrl: '',
  city: '',
  country: '',
  skills: [],
  ...overrides,
});

const felix = make({
  slug: 'felix',
  region: ['EUROPE', 'US', 'APAC'],
  languagesSpoken: ['ENGLISH', 'FRENCH'],
  partnerScope: ['HOSTING', 'DEVELOPMENT'],
});
const rashad = make({
  slug: 'rashad',
  region: ['US', 'EUROPE'],
  languagesSpoken: ['ENGLISH', 'FRENCH'],
  partnerScope: ['DEVELOPMENT'],
});
const acme = make({
  slug: 'acme',
  region: ['MENA'],
  languagesSpoken: ['ENGLISH'],
  partnerScope: ['SUPPORT'],
});

const all = [felix, rashad, acme] as const;

describe('filterPartners', () => {
  it('returns every partner when criteria is empty', () => {
    expect(filterPartners(all, EMPTY_CRITERIA)).toEqual(all);
  });

  it('filters by a single region (single value)', () => {
    const c: FilterCriteria = {
      regions: new Set(['MENA']),
      languages: new Set(),
      categories: new Set(),
    };
    expect(filterPartners(all, c)).toEqual([acme]);
  });

  it('filters by multiple regions (OR within facet)', () => {
    const c: FilterCriteria = {
      regions: new Set(['APAC', 'MENA']),
      languages: new Set(),
      categories: new Set(),
    };
    expect(filterPartners(all, c)).toEqual([felix, acme]);
  });

  it('combines region + language facets with AND', () => {
    const c: FilterCriteria = {
      regions: new Set(['EUROPE']),
      languages: new Set(['FRENCH']),
      categories: new Set(),
    };
    expect(filterPartners(all, c)).toEqual([felix, rashad]);
  });

  it('filters by a single category', () => {
    const c: FilterCriteria = {
      regions: new Set(),
      languages: new Set(),
      categories: new Set(['SUPPORT']),
    };
    expect(filterPartners(all, c)).toEqual([acme]);
  });

  it('filters by multiple categories (OR within facet)', () => {
    const c: FilterCriteria = {
      regions: new Set(),
      languages: new Set(),
      categories: new Set(['HOSTING', 'SUPPORT']),
    };
    expect(filterPartners(all, c)).toEqual([felix, acme]);
  });

  it('returns empty when no partner matches', () => {
    const c: FilterCriteria = {
      regions: new Set(),
      languages: new Set(['GERMAN']),
      categories: new Set(),
    };
    expect(filterPartners(all, c)).toEqual([]);
  });

  it('AND across all three facets', () => {
    const c: FilterCriteria = {
      regions: new Set(['EUROPE']),
      languages: new Set(['FRENCH']),
      categories: new Set(['HOSTING']),
    };
    expect(filterPartners(all, c)).toEqual([felix]);
  });
});

describe('hasAnyFilter', () => {
  it('returns false for empty criteria', () => {
    expect(hasAnyFilter(EMPTY_CRITERIA)).toBe(false);
  });

  it('returns true when any facet has a value', () => {
    expect(
      hasAnyFilter({ ...EMPTY_CRITERIA, regions: new Set(['EUROPE']) }),
    ).toBe(true);
    expect(
      hasAnyFilter({ ...EMPTY_CRITERIA, languages: new Set(['ENGLISH']) }),
    ).toBe(true);
    expect(
      hasAnyFilter({ ...EMPTY_CRITERIA, categories: new Set(['HOSTING']) }),
    ).toBe(true);
  });
});

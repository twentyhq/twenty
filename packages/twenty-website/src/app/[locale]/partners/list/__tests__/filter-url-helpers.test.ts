import {
  PARTNER_SCOPES,
  SERVED_GEOS,
  SPOKEN_LANGUAGES,
} from '@/lib/partners-api';

import {
  buildQueryString,
  parseCriteriaFromParams,
  toggleInSet,
} from '../filter-url-helpers';

describe('parseCriteriaFromParams', () => {
  it('returns empty sets when params are empty', () => {
    const c = parseCriteriaFromParams(new URLSearchParams());
    expect(c.regions.size).toBe(0);
    expect(c.languages.size).toBe(0);
    expect(c.categories.size).toBe(0);
  });

  it('parses a CSV of valid values', () => {
    const c = parseCriteriaFromParams(
      new URLSearchParams(
        'regions=EUROPE,US&languages=FRENCH&categories=HOSTING',
      ),
    );
    expect(c.regions).toEqual(new Set(['EUROPE', 'US']));
    expect(c.languages).toEqual(new Set(['FRENCH']));
    expect(c.categories).toEqual(new Set(['HOSTING']));
  });

  it('silently drops unknown values', () => {
    const c = parseCriteriaFromParams(
      new URLSearchParams('regions=EUROPE,MARS,US&categories=KLINGON'),
    );
    expect(c.regions).toEqual(new Set(['EUROPE', 'US']));
    expect(c.categories.size).toBe(0);
  });

  it('handles whitespace inside CSV values', () => {
    const c = parseCriteriaFromParams(
      new URLSearchParams('regions=EUROPE, US , LATAM'),
    );
    expect(c.regions).toEqual(new Set(['EUROPE', 'US', 'LATAM']));
  });
});

describe('buildQueryString', () => {
  it('returns empty string when criteria is empty', () => {
    expect(
      buildQueryString({
        regions: new Set(),
        languages: new Set(),
        categories: new Set(),
      }),
    ).toBe('');
  });

  it('round-trips with parseCriteriaFromParams', () => {
    const original = {
      regions: new Set(['EUROPE', 'US']) as ReadonlySet<'EUROPE' | 'US'>,
      languages: new Set(['FRENCH']) as ReadonlySet<'FRENCH'>,
      categories: new Set(['HOSTING']) as ReadonlySet<'HOSTING'>,
    };
    const qs = buildQueryString(original as never);
    const parsed = parseCriteriaFromParams(new URLSearchParams(qs));
    expect(parsed.regions).toEqual(original.regions);
    expect(parsed.languages).toEqual(original.languages);
    expect(parsed.categories).toEqual(original.categories);
  });

  it('omits facets whose sets are empty', () => {
    const qs = buildQueryString({
      regions: new Set(['EUROPE']),
      languages: new Set(),
      categories: new Set(),
    });
    expect(qs).toBe('regions=EUROPE');
  });
});

describe('toggleInSet', () => {
  it('adds value when absent', () => {
    expect(toggleInSet(new Set(['A']), 'B')).toEqual(new Set(['A', 'B']));
  });

  it('removes value when present', () => {
    expect(toggleInSet(new Set(['A', 'B']), 'B')).toEqual(new Set(['A']));
  });

  it('does not mutate the original set', () => {
    const original = new Set(['A']);
    toggleInSet(original, 'B');
    expect(original).toEqual(new Set(['A']));
  });
});

describe('enum constants are non-empty', () => {
  it('covers all known regions, languages, categories', () => {
    expect(SERVED_GEOS.length).toBe(6);
    expect(SPOKEN_LANGUAGES.length).toBe(35);
    expect(PARTNER_SCOPES.length).toBe(5);
  });
});

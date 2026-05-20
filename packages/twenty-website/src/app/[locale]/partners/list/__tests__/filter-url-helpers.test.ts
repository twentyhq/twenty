import {
  DEPLOYMENT_EXPERTISES,
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
    expect(c.deployments.size).toBe(0);
  });

  it('parses a CSV of valid values', () => {
    const c = parseCriteriaFromParams(
      new URLSearchParams(
        'regions=EUROPE,US&languages=FRENCH&deployments=CLOUD',
      ),
    );
    expect(c.regions).toEqual(new Set(['EUROPE', 'US']));
    expect(c.languages).toEqual(new Set(['FRENCH']));
    expect(c.deployments).toEqual(new Set(['CLOUD']));
  });

  it('silently drops unknown values', () => {
    const c = parseCriteriaFromParams(
      new URLSearchParams('regions=EUROPE,MARS,US&languages=KLINGON'),
    );
    expect(c.regions).toEqual(new Set(['EUROPE', 'US']));
    expect(c.languages.size).toBe(0);
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
        deployments: new Set(),
      }),
    ).toBe('');
  });

  it('round-trips with parseCriteriaFromParams', () => {
    const original = {
      regions: new Set(['EUROPE', 'US']) as ReadonlySet<'EUROPE' | 'US'>,
      languages: new Set(['FRENCH']) as ReadonlySet<'FRENCH'>,
      deployments: new Set(['CLOUD']) as ReadonlySet<'CLOUD'>,
    };
    const qs = buildQueryString(original as never);
    const parsed = parseCriteriaFromParams(new URLSearchParams(qs));
    expect(parsed.regions).toEqual(original.regions);
    expect(parsed.languages).toEqual(original.languages);
    expect(parsed.deployments).toEqual(original.deployments);
  });

  it('omits facets whose sets are empty', () => {
    const qs = buildQueryString({
      regions: new Set(['EUROPE']),
      languages: new Set(),
      deployments: new Set(),
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
  it('covers all known regions, languages, deployments', () => {
    expect(SERVED_GEOS.length).toBe(6);
    expect(SPOKEN_LANGUAGES.length).toBe(5);
    expect(DEPLOYMENT_EXPERTISES.length).toBe(2);
  });
});

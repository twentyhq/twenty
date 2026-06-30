import { buildFilterQuery } from './build-filter-query';
import { EMPTY_FILTER_CRITERIA, type FilterCriteria } from './filter-criteria';
import { parseFilterCriteria } from './parse-filter-criteria';
import { toggleInSet } from './toggle-in-set';

describe('buildFilterQuery', () => {
  it('is empty for no selection', () => {
    expect(buildFilterQuery(EMPTY_FILTER_CRITERIA)).toBe('');
  });

  it('encodes selected facets, sorted', () => {
    const criteria: FilterCriteria = {
      regions: new Set(['US', 'EUROPE']),
      languages: new Set(),
      categories: new Set(['DEVELOPMENT']),
    };
    const params = new URLSearchParams(buildFilterQuery(criteria));
    expect(params.get('regions')).toBe('EUROPE,US');
    expect(params.get('categories')).toBe('DEVELOPMENT');
    expect(params.get('languages')).toBeNull();
  });
});

describe('parseFilterCriteria', () => {
  it('parses valid facet values', () => {
    const criteria = parseFilterCriteria(
      new URLSearchParams('regions=EUROPE,US&categories=DEVELOPMENT'),
    );
    expect([...criteria.regions]).toEqual(['EUROPE', 'US']);
    expect([...criteria.categories]).toEqual(['DEVELOPMENT']);
  });

  it('drops values outside the facet vocabulary', () => {
    const criteria = parseFilterCriteria(
      new URLSearchParams('regions=EUROPE,MARS'),
    );
    expect([...criteria.regions]).toEqual(['EUROPE']);
  });

  it('round-trips with buildFilterQuery', () => {
    const criteria: FilterCriteria = {
      regions: new Set(['US']),
      languages: new Set(['FRENCH']),
      categories: new Set(),
    };
    const reparsed = parseFilterCriteria(
      new URLSearchParams(buildFilterQuery(criteria)),
    );
    expect([...reparsed.regions]).toEqual(['US']);
    expect([...reparsed.languages]).toEqual(['FRENCH']);
    expect([...reparsed.categories]).toEqual([]);
  });
});

describe('toggleInSet', () => {
  it('adds a missing value', () => {
    expect([...toggleInSet(new Set(['A']), 'B')]).toEqual(['A', 'B']);
  });

  it('removes a present value', () => {
    expect([...toggleInSet(new Set(['A', 'B']), 'A')]).toEqual(['B']);
  });

  it('does not mutate the input set', () => {
    const original = new Set(['A']);
    toggleInSet(original, 'B');
    expect([...original]).toEqual(['A']);
  });
});

import { filterSkillSuggestions } from '@/design-system/components/Form/skill-suggestions';

const POOL = ['React', 'PostgreSQL', 'Python', 'Shopify'];

describe('filterSkillSuggestions', () => {
  it('returns [] for an empty query', () => {
    expect(filterSkillSuggestions(POOL, [], '')).toEqual([]);
    expect(filterSkillSuggestions(POOL, [], '   ')).toEqual([]);
  });

  it('matches case-insensitively by substring', () => {
    expect(filterSkillSuggestions(POOL, [], 'p')).toEqual([
      'PostgreSQL',
      'Python',
      'Shopify',
    ]);
    expect(filterSkillSuggestions(POOL, [], 'sql')).toEqual(['PostgreSQL']);
  });

  it('excludes already-selected values (case-insensitive)', () => {
    expect(filterSkillSuggestions(POOL, ['postgresql'], 'p')).toEqual([
      'Python',
      'Shopify',
    ]);
  });
});

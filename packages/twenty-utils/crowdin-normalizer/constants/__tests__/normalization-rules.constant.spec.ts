import { NORMALIZATION_RULES } from '../normalization-rules.constant';

const namesFor = (format: 'po' | 'mdx') =>
  NORMALIZATION_RULES.filter((rule) => rule.formats.includes(format)).map(
    (rule) => rule.name,
  );

describe('NORMALIZATION_RULES', () => {
  it('gives every rule at least one format to run against', () => {
    for (const rule of NORMALIZATION_RULES) {
      expect(rule.formats.length).toBeGreaterThan(0);
    }
  });

  it('names every rule uniquely', () => {
    const names = NORMALIZATION_RULES.map((rule) => rule.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('keeps the ICU rules away from MDX, where braces are JSX', () => {
    expect(namesFor('mdx')).toEqual([
      'escaped-every-character',
      'escaped-inline-code-tags',
      'translated-identifier',
      'localized-expression-digits',
    ]);
  });

  it('runs every rule but the MDX-specific ones against PO catalogs', () => {
    const mdxOnly = NORMALIZATION_RULES.filter(
      (rule) => !rule.formats.includes('po'),
    ).map((rule) => rule.name);

    expect(mdxOnly).toEqual([
      'translated-identifier',
      'localized-expression-digits',
    ]);
    expect(namesFor('po')).toHaveLength(
      NORMALIZATION_RULES.length - mdxOnly.length,
    );
  });
});

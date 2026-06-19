import { CASE_STUDY_CATALOG } from './case-study-catalog';
import { getCaseStudyAccent } from './case-study-palette';
import { CLIENT_LOGOS } from './client-logo-config';

describe('case-study catalog data', () => {
  it('has unique slugs', () => {
    const slugs = CASE_STUDY_CATALOG.map((entry) => entry.slug);
    expect(slugs.length).toBeGreaterThan(0);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('points every entry at a defined client logo', () => {
    for (const entry of CASE_STUDY_CATALOG) {
      expect(CLIENT_LOGOS[entry.clientIcon]).toBeDefined();
    }
  });

  it('cycles four accents by catalog position', () => {
    expect(getCaseStudyAccent(0)).toBe(getCaseStudyAccent(4));
    expect(getCaseStudyAccent(0)).not.toBe(getCaseStudyAccent(1));
  });
});

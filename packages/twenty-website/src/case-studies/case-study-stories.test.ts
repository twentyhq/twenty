import { CASE_STUDY_CATALOG } from './case-study-catalog';
import { CASE_STUDY_STORIES } from './case-study-stories';

describe('CASE_STUDY_STORIES', () => {
  const catalogSlugs = CASE_STUDY_CATALOG.map((entry) => entry.slug);
  const storySlugs = Object.keys(CASE_STUDY_STORIES);

  it('has a story for every catalog entry and vice versa', () => {
    expect(storySlugs.toSorted()).toEqual(catalogSlugs.toSorted());
  });

  it('gives each section one table-of-contents label', () => {
    for (const story of Object.values(CASE_STUDY_STORIES)) {
      expect(story.tableOfContents).toHaveLength(story.sections.length);
    }
  });

  it('gives each section at least one paragraph', () => {
    for (const story of Object.values(CASE_STUDY_STORIES)) {
      for (const section of story.sections) {
        expect(section.paragraphs.length).toBeGreaterThan(0);
      }
    }
  });
});

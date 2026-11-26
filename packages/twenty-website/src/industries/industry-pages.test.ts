import { msg } from '@lingui/core/macro';

import { CASE_STUDY_CATALOG } from '@/case-studies/case-study-catalog';

import { setupI18n } from '@lingui/core';

import { buildIndustryPreviewConfig } from './build-industry-preview-config';
import { getRelatedIndustryPages } from './get-related-industry-pages';
import { INDUSTRY_COPY_LIMITS } from './industry-copy-limits';
import { INDUSTRY_PAGES } from './industry-pages';
import { INDUSTRY_PAGES_BY_SLUG } from './industry-pages-by-slug';
import { REAL_ESTATE_INDUSTRY_PAGE } from './pages/real-estate.industry-page';
import { resolveIndustryPage } from './resolve-industry-page';
import { validateIndustryPage } from './validate-industry-page';

const CASE_STUDY_SLUGS = new Set(CASE_STUDY_CATALOG.map((entry) => entry.slug));

describe('industry pages', () => {
  it('gives every category exactly its quota of sub-categories', () => {
    for (const page of INDUSTRY_PAGES) {
      if (page.kind !== 'category') {
        continue;
      }
      const subCategoryCount = INDUSTRY_PAGES.filter(
        (candidate) =>
          candidate.kind === 'subCategory' &&
          candidate.parentSlug === page.slug,
      ).length;
      expect([page.slug, subCategoryCount]).toEqual([
        page.slug,
        INDUSTRY_COPY_LIMITS.subCategoriesPerCategory,
      ]);
    }
  });

  it('links a sub-category to its category and siblings, not itself', () => {
    const subCategory = INDUSTRY_PAGES_BY_SLUG.get('commercial-real-estate')!;
    const related = getRelatedIndustryPages(subCategory, INDUSTRY_PAGES).map(
      (page) => page.slug,
    );
    expect(related).toContain('real-estate');
    expect(related).not.toContain('commercial-real-estate');
    expect(related.length).toBe(INDUSTRY_COPY_LIMITS.subCategoriesPerCategory);
  });

  it('has unique slugs', () => {
    const slugs = INDUSTRY_PAGES.map((page) => page.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it.each(INDUSTRY_PAGES.map((page) => [page.slug, page] as const))(
    '%s follows the framework rules',
    (_slug, definition) => {
      const page = resolveIndustryPage(definition, INDUSTRY_PAGES_BY_SLUG);
      expect(validateIndustryPage(page, CASE_STUDY_SLUGS)).toEqual([]);
    },
  );

  it.each(INDUSTRY_PAGES.map((page) => [page.slug, page] as const))(
    '%s opens its product window on a sidebar entry',
    (_slug, definition) => {
      const page = resolveIndustryPage(definition, INDUSTRY_PAGES_BY_SLUG);
      const i18n = setupI18n({ locale: 'en', messages: { en: {} } });
      const { sidebar } = buildIndustryPreviewConfig(page, i18n);
      const itemIds = [...sidebar.favorites, ...sidebar.workspace].map(
        (item) => item.id,
      );
      expect(itemIds).toContain(sidebar.initialActiveItemId);
    },
  );

  it('lets a sub-category extend the model and reuse category items explicitly', () => {
    const page = resolveIndustryPage(
      INDUSTRY_PAGES_BY_SLUG.get('commercial-real-estate')!,
      INDUSTRY_PAGES_BY_SLUG,
    );
    expect(page.parent?.slug).toBe('real-estate');
    expect(page.workflows.items[2]).toBe(
      REAL_ESTATE_INDUSTRY_PAGE.workflows.items[1],
    );
    expect(page.customScreen.placedOn).toBe('requirement');
    expect(page.dataModel.objects.map((object) => object.id)).toContain(
      'requirement',
    );
  });
});

describe('validateIndustryPage', () => {
  const basePage = resolveIndustryPage(
    REAL_ESTATE_INDUSTRY_PAGE,
    INDUSTRY_PAGES_BY_SLUG,
  );

  it('flags filler phrases and exclamation marks', () => {
    const page = {
      ...basePage,
      hero: { ...basePage.hero, body: msg`A seamless CRM for agencies!` },
    };
    expect(validateIndustryPage(page, CASE_STUDY_SLUGS)).toEqual([
      'hero.body: uses "seamless"',
      'hero.body: exclamation mark',
    ]);
  });

  it('flags references to objects the model does not define', () => {
    const page = {
      ...basePage,
      customScreen: { ...basePage.customScreen, placedOn: 'tenancy' },
    };
    expect(validateIndustryPage(page, CASE_STUDY_SLUGS)).toEqual([
      'customScreen.placedOn: unknown object "tenancy"',
    ]);
  });

  it('refuses placeholders on live pages only', () => {
    const draft = {
      ...basePage,
      switching: { ...basePage.switching, note: msg`[Check the export]` },
    };
    expect(validateIndustryPage(draft, CASE_STUDY_SLUGS)).toEqual([]);
    expect(
      validateIndustryPage({ ...draft, status: 'live' }, CASE_STUDY_SLUGS),
    ).toEqual(['switching.note: unresolved [placeholder] on a live page']);
  });

  it('refuses customer names on a page that does not feature that story', () => {
    const page = { ...basePage, proof: { kind: 'none' as const } };
    expect(validateIndustryPage(page, CASE_STUDY_SLUGS)).toContain(
      'questions[1].answer: names "Homeseller" but the page\'s proof is not that story',
    );
  });

  it('refuses proof that points at a missing story', () => {
    const page = {
      ...basePage,
      proof: { kind: 'caseStudy' as const, caseStudySlug: 'unknown' },
    };
    expect(validateIndustryPage(page, CASE_STUDY_SLUGS)).toContain(
      'proof: unknown case study "unknown"',
    );
  });

  it('refuses agents that change nothing', () => {
    const [firstAgent, ...otherAgents] = basePage.agents.items;
    const page = {
      ...basePage,
      agents: {
        ...basePage.agents,
        items: [{ ...firstAgent, writes: [] }, ...otherAgents],
      },
    };
    expect(validateIndustryPage(page, CASE_STUDY_SLUGS)).toEqual([
      'agents.items[0]: an agent must write at least one object',
    ]);
  });

  it('refuses a custom screen preview whose rows miss a column', () => {
    const { preview } = basePage.customScreen;
    const page = {
      ...basePage,
      customScreen: {
        ...basePage.customScreen,
        preview: {
          ...preview,
          rows: [{ ...preview.rows[0], cells: preview.rows[0].cells.slice(1) }],
        },
      },
    };
    expect(validateIndustryPage(page, CASE_STUDY_SLUGS)).toEqual([
      'customScreen.preview.rows[0]: 3 cells for 4 columns',
    ]);
  });
});

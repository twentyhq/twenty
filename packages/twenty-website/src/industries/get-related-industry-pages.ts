import {
  type IndustryPageDefinition,
  type IndustryRelatedPage,
} from './industry-page-types';

const toRelatedPage = (page: IndustryPageDefinition): IndustryRelatedPage => ({
  slug: page.slug,
  name: page.name,
  summary: page.hero.body,
});

export const getRelatedIndustryPages = (
  page: IndustryPageDefinition,
  pages: readonly IndustryPageDefinition[],
): IndustryRelatedPage[] => {
  const categorySlug = page.kind === 'category' ? page.slug : page.parentSlug;

  return pages
    .filter(
      (candidate) =>
        candidate.slug !== page.slug &&
        (candidate.slug === categorySlug ||
          (candidate.kind === 'subCategory' &&
            candidate.parentSlug === categorySlug)),
    )
    .map(toRelatedPage);
};

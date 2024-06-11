import { DocsArticlesProps } from '@/content/user-guide/constants/getDocsArticles';

export const filterDocsIndex = (
  docsIndex: DocsArticlesProps[],
  sectionName: string,
): DocsArticlesProps[] => {
  return docsIndex.filter(
    (guide) =>
      guide.section.includes(sectionName) && guide.title.includes(guide.topic),
  );
};

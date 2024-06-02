import { DocsArticlesProps } from '@/content/user-guide/constants/getDocsArticles';

export const constructSections = (
  docsArticleCards: DocsArticlesProps[],
  isSection: boolean,
): { name: string; info: string }[] => {
  if (isSection) {
    return [
      {
        name: docsArticleCards[0]?.topic,
        info: docsArticleCards[0]?.sectionInfo,
      },
    ];
  } else {
    return Array.from(
      new Map(
        docsArticleCards
          .filter((guide) => guide.numberOfFiles > 0)
          .map((guide) => [guide.section, guide]),
      ).values(),
    ).map((guide) => ({
      name: guide.section,
      info: guide.sectionInfo,
    }));
  }
};

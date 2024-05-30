import { DocsArticlesProps } from '@/content/user-guide/constants/getDocsArticles';

export const groupArticlesByTopic = (
  items: DocsArticlesProps[],
): Record<string, DocsArticlesProps[]> => {
  return items.reduce(
    (acc, item) => {
      acc[item.topic] = acc[item.topic] || [];
      acc[item.topic].push(item);
      return acc;
    },
    {} as Record<string, DocsArticlesProps[]>,
  );
};

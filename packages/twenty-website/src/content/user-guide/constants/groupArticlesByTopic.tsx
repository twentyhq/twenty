import { UserGuideArticlesProps } from '@/content/user-guide/constants/getUserGuideArticles';

export const groupArticlesByTopic = (
  items: UserGuideArticlesProps[],
): Record<string, UserGuideArticlesProps[]> => {
  return items.reduce(
    (acc, item) => {
      acc[item.topic] = acc[item.topic] || [];
      acc[item.topic].push(item);
      return acc;
    },
    {} as Record<string, UserGuideArticlesProps[]>,
  );
};

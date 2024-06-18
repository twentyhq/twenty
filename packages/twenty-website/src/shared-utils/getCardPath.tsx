import { DocsArticlesProps } from '@/content/user-guide/constants/getDocsArticles';

export const getCardPath = (
  card: DocsArticlesProps,
  basePath: string,
  isSection: boolean,
  sectionName?: string,
) => {
  const isPlayground = [
    'core-api-rest',
    'metadata-api-rest',
    'core-api-graphql',
    'metadata-api-graphql',
  ];

  if (isPlayground.includes(card.fileName)) {
    const apiType = card.fileName.includes('rest') ? 'rest-api' : 'graphql';
    const apiName = card.fileName.includes('core') ? 'core' : 'metadata';
    return `/developers/${apiType}/${apiName}`;
  } else if (card.fileName.includes('storybook')) {
    return 'https://storybook.twenty.com';
  } else if (card.fileName.includes('components')) {
    return `/twenty-ui`;
  } else {
    if (sectionName) {
      return card.numberOfFiles > 1
        ? `${basePath}section/${sectionName}/${card.fileName}`
        : `${basePath}${card.fileName}`;
    } else {
      return card.numberOfFiles > 1 && !isSection
        ? `${basePath}/section/${card.fileName}`
        : `${basePath}/${card.fileName}`;
    }
  }
};

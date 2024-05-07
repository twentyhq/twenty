import psl from 'psl';

export const getDomainNameFromHandle = (handle: string): string => {
  const wholeDomain = handle?.split('@')?.[1] || '';

  const { domain } = psl.parse(wholeDomain);

  return domain || '';
};

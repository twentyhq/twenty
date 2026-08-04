const MAX_LABEL_LENGTH = 64;

export const formatMetadataLabel = (nameSingular: string): string => {
  const kebab = nameSingular.replace(
    /([A-Z])/g,
    (match) => `-${match.toLowerCase()}`,
  );

  return kebab
    .split('-')
    .filter((word) => word.length > 0)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
    .slice(0, MAX_LABEL_LENGTH);
};

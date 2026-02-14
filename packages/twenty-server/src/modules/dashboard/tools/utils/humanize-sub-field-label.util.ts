export const humanizeSubFieldLabel = (value: string) => {
  if (!value) return '';

  const withSpaces = value
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();

  return withSpaces
    .split(' ')
    .map((part) =>
      part.length > 0
        ? part[0].toUpperCase() + part.slice(1).toLowerCase()
        : '',
    )
    .join(' ');
};

export const searchAndReplaceLast = ({
  replace,
  search,
  source,
}: {
  source: string;
  search: string;
  replace: string;
}) => {
  const lastIndex = source.lastIndexOf(search);

  if (lastIndex === -1) return source;

  return (
    source.slice(0, lastIndex) +
    replace +
    source.slice(lastIndex + search.length)
  );
};

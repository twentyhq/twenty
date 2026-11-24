import { isDefined } from 'twenty-shared/utils';

export const paginateMetadataItemsByKeyset = <TItem, TCursor>({
  items,
  limit,
  afterCursor,
  toCursor,
  compareCursors,
}: {
  items: TItem[];
  limit: number;
  afterCursor: TCursor | undefined;
  toCursor: (item: TItem) => TCursor;
  compareCursors: (firstCursor: TCursor, secondCursor: TCursor) => number;
}): { entries: { item: TItem; cursor: TCursor }[]; hasNextPage: boolean } => {
  const sortedEntries = items
    .map((item) => ({ item, cursor: toCursor(item) }))
    .sort((firstEntry, secondEntry) =>
      compareCursors(firstEntry.cursor, secondEntry.cursor),
    );

  const entriesAfterCursor = isDefined(afterCursor)
    ? sortedEntries.filter(
        ({ cursor }) => compareCursors(cursor, afterCursor) > 0,
      )
    : sortedEntries;

  return {
    entries: entriesAfterCursor.slice(0, limit),
    hasNextPage: entriesAfterCursor.length > limit,
  };
};

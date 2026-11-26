import { isDefined } from 'twenty-shared/utils';

import {
  decodeCursor,
  encodeCursorData,
} from 'src/engine/api/common/utils/cursors.util';
import { type MetadataKeysetCursor } from 'src/engine/metadata-modules/pagination/types/metadata-keyset-cursor.type';

export const paginateMetadataItemsByKeyset = <TItem extends { id: string }>({
  items,
  limit,
  after,
  direction,
  getSortValue,
  compareSortValues,
}: {
  items: TItem[];
  limit: number;
  after: string | undefined;
  direction: 'ASC' | 'DESC';
  getSortValue: (item: NoInfer<TItem>) => string | null;
  compareSortValues: (
    firstSortValue: string,
    secondSortValue: string,
  ) => number;
}): { entries: { item: TItem; cursor: string }[]; hasNextPage: boolean } => {
  const afterCursor = isDefined(after)
    ? decodeCursor<MetadataKeysetCursor>(after)
    : undefined;

  const directionFactor = direction === 'ASC' ? 1 : -1;

  const compareCursors = (
    firstCursor: MetadataKeysetCursor,
    secondCursor: MetadataKeysetCursor,
  ): number => {
    const { sortValue: firstSortValue } = firstCursor;
    const { sortValue: secondSortValue } = secondCursor;

    if (isDefined(firstSortValue) !== isDefined(secondSortValue)) {
      return isDefined(firstSortValue) ? -1 : 1;
    }

    const sortValueComparison =
      isDefined(firstSortValue) && isDefined(secondSortValue)
        ? compareSortValues(firstSortValue, secondSortValue)
        : 0;

    return (
      directionFactor *
      (sortValueComparison || firstCursor.id.localeCompare(secondCursor.id))
    );
  };

  const sortedEntries = items
    .map((item) => ({
      item,
      cursor: { sortValue: getSortValue(item), id: item.id },
    }))
    .sort((firstEntry, secondEntry) =>
      compareCursors(firstEntry.cursor, secondEntry.cursor),
    );

  const entriesAfterCursor = isDefined(afterCursor)
    ? sortedEntries.filter(
        ({ cursor }) => compareCursors(cursor, afterCursor) > 0,
      )
    : sortedEntries;

  return {
    entries: entriesAfterCursor
      .slice(0, limit)
      .map(({ item, cursor }) => ({ item, cursor: encodeCursorData(cursor) })),
    hasNextPage: entriesAfterCursor.length > limit,
  };
};

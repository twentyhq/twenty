import { isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral, type SelectQueryBuilder } from 'typeorm';

import { type CursorPaginationDirection } from 'src/engine/api/types/cursor-pagination-direction.type';
import { buildCursorPage } from 'src/engine/api/utils/build-cursor-page.util';

export type MetadataCursorPagination = {
  limit: number;
  direction: CursorPaginationDirection;
  afterId?: string;
  beforeId?: string;
};

export type MetadataCursorPageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
};

export type MetadataCursorPage<TEntity extends { id: string }> = {
  items: TEntity[];
  pageInfo: MetadataCursorPageInfo;
};

const buildMetadataCursorPage = <TEntity extends { id: string }>({
  fetchedItems,
  pagination,
}: {
  fetchedItems: TEntity[];
  pagination: MetadataCursorPagination;
}): MetadataCursorPage<TEntity> => {
  const { items, pageInfo } = buildCursorPage({
    fetchedItems,
    limit: pagination.limit,
    direction: pagination.direction,
    hasAfterCursor: isDefined(pagination.afterId),
    hasBeforeCursor: isDefined(pagination.beforeId),
  });

  return {
    items,
    pageInfo: {
      ...pageInfo,
      startCursor: items[0]?.id ?? null,
      endCursor: items[items.length - 1]?.id ?? null,
    },
  };
};

// Transport-neutral keyset pagination for core metadata. REST and GraphQL own
// their argument names and cursor encoding, while this utility owns ordering,
// boundaries and page-info semantics.
export const paginateMetadataQueryBuilder = async <
  TEntity extends ObjectLiteral & { id: string },
>({
  queryBuilder,
  alias,
  pagination,
}: {
  queryBuilder: SelectQueryBuilder<TEntity>;
  alias: string;
  pagination: MetadataCursorPagination;
}): Promise<MetadataCursorPage<TEntity>> => {
  const isBackwardPagination = pagination.direction === 'backward';

  queryBuilder.orderBy(
    `"${alias}"."id"`,
    isBackwardPagination ? 'ASC' : 'DESC',
  );

  if (isDefined(pagination.afterId)) {
    queryBuilder.andWhere(`"${alias}"."id" < :metadataPaginationCursorId`, {
      metadataPaginationCursorId: pagination.afterId,
    });
  }

  if (isDefined(pagination.beforeId)) {
    queryBuilder.andWhere(`"${alias}"."id" > :metadataPaginationCursorId`, {
      metadataPaginationCursorId: pagination.beforeId,
    });
  }

  const fetchedItems = await queryBuilder.take(pagination.limit + 1).getMany();

  return buildMetadataCursorPage({ fetchedItems, pagination });
};

export const paginateMetadataItemsById = <TEntity extends { id: string }>({
  items,
  pagination,
}: {
  items: TEntity[];
  pagination: MetadataCursorPagination;
}): MetadataCursorPage<TEntity> => {
  const isBackwardPagination = pagination.direction === 'backward';
  const fetchedItems = items
    .filter(({ id }) => {
      if (isDefined(pagination.afterId)) {
        return id < pagination.afterId;
      }

      if (isDefined(pagination.beforeId)) {
        return id > pagination.beforeId;
      }

      return true;
    })
    .sort(({ id: firstId }, { id: secondId }) =>
      isBackwardPagination
        ? firstId.localeCompare(secondId)
        : secondId.localeCompare(firstId),
    )
    .slice(0, pagination.limit + 1);

  return buildMetadataCursorPage({ fetchedItems, pagination });
};

// Some metadata collections have meaningful domain ordering (for example view
// fields by position). Their cursor is an identity marker within that stable
// ordered result, not a sortable key.
export const paginateMetadataOrderedItems = <TEntity extends { id: string }>({
  items,
  pagination,
}: {
  items: TEntity[];
  pagination: MetadataCursorPagination;
}): MetadataCursorPage<TEntity> => {
  const cursorId = pagination.afterId ?? pagination.beforeId;
  const cursorIndex = isDefined(cursorId)
    ? items.findIndex(({ id }) => id === cursorId)
    : undefined;

  if (cursorIndex === -1) {
    return buildMetadataCursorPage({ fetchedItems: [], pagination });
  }

  const fetchedItems =
    pagination.direction === 'backward'
      ? items
          .slice(0, cursorIndex ?? items.length)
          .reverse()
          .slice(0, pagination.limit + 1)
      : items.slice(
          (cursorIndex ?? -1) + 1,
          (cursorIndex ?? -1) + pagination.limit + 2,
        );

  return buildMetadataCursorPage({ fetchedItems, pagination });
};

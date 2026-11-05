import { isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';

import { type MetadataCursorPage } from 'src/engine/metadata-modules/pagination/types/metadata-cursor-page.type';
import { type MetadataCursorPagination } from 'src/engine/metadata-modules/pagination/types/metadata-cursor-pagination.type';
import { buildMetadataCursorPage } from 'src/engine/metadata-modules/pagination/utils/build-metadata-cursor-page.util';

export type PaginableMetadataQueryBuilder<TEntity> = {
  orderBy: (column: string, direction: 'ASC' | 'DESC') => unknown;
  andWhere: (condition: string, parameters: ObjectLiteral) => unknown;
  take: (limit: number) => { getMany: () => Promise<TEntity[]> };
};

export const paginateMetadataQueryBuilder = async <
  TEntity extends ObjectLiteral & { id: string },
>({
  queryBuilder,
  alias,
  pagination,
}: {
  queryBuilder: PaginableMetadataQueryBuilder<TEntity>;
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

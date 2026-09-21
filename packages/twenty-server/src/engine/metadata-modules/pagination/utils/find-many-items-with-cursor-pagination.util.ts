import { type CursorConnection } from 'src/engine/metadata-modules/pagination/dtos/cursor-connection-type.factory';
import { type CursorPagingInput } from 'src/engine/metadata-modules/pagination/dtos/cursor-paging.input';
import { paginateMetadataItemsById } from 'src/engine/metadata-modules/pagination/utils/paginate-metadata-items-by-id.util';
import { parseGraphqlMetadataPagination } from 'src/engine/metadata-modules/pagination/utils/parse-graphql-metadata-pagination.util';
import { toCursorConnection } from 'src/engine/metadata-modules/pagination/utils/to-cursor-connection.util';

export const findManyItemsWithCursorPagination = <
  TEntity extends { id: string },
>({
  items,
  paging,
  defaultResultSize,
  maxResultsSize,
}: {
  items: TEntity[];
  paging: CursorPagingInput | undefined;
  defaultResultSize?: number;
  maxResultsSize?: number;
}): CursorConnection<TEntity> => {
  const pagination = parseGraphqlMetadataPagination({
    paging,
    defaultResultSize,
    maxResultsSize,
  });

  return toCursorConnection(paginateMetadataItemsById({ items, pagination }));
};

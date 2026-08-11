import { isDefined } from 'twenty-shared/utils';
import { validate as uuidValidate } from 'uuid';

import { decodeCursor } from 'src/engine/api/graphql/graphql-query-runner/utils/cursors.util';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type CursorPagingInput } from 'src/engine/metadata-modules/pagination/dtos/cursor-paging.input';
import { type MetadataCursorPagination } from 'src/engine/metadata-modules/pagination/types/metadata-cursor-pagination.type';

const DEFAULT_METADATA_GRAPHQL_PAGE_SIZE = 10;
const MAX_METADATA_GRAPHQL_PAGE_SIZE = 1000;

const decodeCursorIdOrThrow = (cursor: string): string => {
  let cursorData: unknown;

  try {
    cursorData = decodeCursor(cursor);
  } catch {
    throw new UserInputError(`Invalid cursor: ${cursor}`);
  }

  if (
    typeof cursorData !== 'object' ||
    cursorData === null ||
    Array.isArray(cursorData) ||
    typeof (cursorData as { id?: unknown }).id !== 'string' ||
    !uuidValidate((cursorData as { id: string }).id)
  ) {
    throw new UserInputError(`Invalid cursor: ${cursor}`);
  }

  return (cursorData as { id: string }).id;
};

export const parseGraphqlMetadataPagination = ({
  paging,
  defaultResultSize = DEFAULT_METADATA_GRAPHQL_PAGE_SIZE,
  maxResultsSize = MAX_METADATA_GRAPHQL_PAGE_SIZE,
}: {
  paging: CursorPagingInput | undefined;
  defaultResultSize?: number;
  maxResultsSize?: number;
}): MetadataCursorPagination => {
  const { first, last, after, before } = paging ?? {};

  if (isDefined(first) && isDefined(last)) {
    throw new UserInputError('Cannot use both first and last');
  }

  if (isDefined(first) && isDefined(before)) {
    throw new UserInputError('Cannot use first with before');
  }

  if (isDefined(last) && isDefined(after)) {
    throw new UserInputError('Cannot use last with after');
  }

  if (isDefined(after) && isDefined(before)) {
    throw new UserInputError('Cannot use both after and before');
  }

  if ((isDefined(first) && first < 0) || (isDefined(last) && last < 0)) {
    throw new UserInputError('Page size cannot be negative');
  }

  const limit = first ?? last ?? defaultResultSize;

  if (limit > maxResultsSize) {
    throw new UserInputError(
      `Requested page size of ${limit} exceeds the maximum size of ${maxResultsSize}`,
    );
  }

  return {
    limit,
    direction: isDefined(last) || isDefined(before) ? 'backward' : 'forward',
    afterId: isDefined(after) ? decodeCursorIdOrThrow(after) : undefined,
    beforeId: isDefined(before) ? decodeCursorIdOrThrow(before) : undefined,
  };
};

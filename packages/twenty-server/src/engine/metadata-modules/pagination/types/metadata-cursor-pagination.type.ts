import { type CursorPaginationDirection } from 'src/engine/api/types/cursor-pagination-direction.type';

export type MetadataCursorPagination = {
  limit: number;
  direction: CursorPaginationDirection;
  afterId?: string;
  beforeId?: string;
};

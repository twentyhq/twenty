export type OffsetPaginationConfig = {
  type: 'offset';
  paramName: string;
  pageSize: number;
  maxPages?: number;
};

export type CursorPaginationConfig = {
  type: 'cursor';
  paramName: string;
  cursorPath: string;
  pageSize: number;
  maxPages?: number;
};

export type PagePaginationConfig = {
  type: 'page';
  paramName: string;
  pageSize: number;
  maxPages?: number;
};

export type PaginationConfig =
  | OffsetPaginationConfig
  | CursorPaginationConfig
  | PagePaginationConfig;

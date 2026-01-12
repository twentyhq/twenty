import { type QueryCursorDirection } from './QueryCursorDirection';
import { type RecordGqlOperationFilter } from './RecordGqlOperationFilter';
import { type RecordGqlOperationOrderBy } from './RecordGqlOperationOrderBy';

export type RecordGqlOperationVariables = {
  filter?: RecordGqlOperationFilter;
  orderBy?: RecordGqlOperationOrderBy;
  limit?: number;
  cursorFilter?: {
    cursor: string;
    cursorDirection: QueryCursorDirection;
  };
};

import { type RawQueryExecutor } from 'src/engine/twenty-orm/field-operations/file-lifecycle/types/raw-query-executor.type';

export type RichTextFieldRecordTable = {
  tableExpression: string;
  executeRawQuery: RawQueryExecutor;
};

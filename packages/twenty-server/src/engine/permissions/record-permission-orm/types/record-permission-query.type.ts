import { type NamedParameters } from 'src/engine/workspace-query-executor/utils/compile-named-parameters.util';

export type RecordPermissionQuery = {
  sql: string;
  parameters: NamedParameters;
};

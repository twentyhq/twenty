import { type NamedParameters } from 'src/engine/twenty-orm/sql/utils/compile-named-parameters.util';

export type RecordPermissionQuery = {
  sql: string;
  parameters: NamedParameters;
};

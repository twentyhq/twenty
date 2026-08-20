import { type CompiledStatement } from 'src/engine/twenty-orm-v2/sql/utils/compile-named-parameters.util';

export type QueryExecutorV2 = {
  execute: (statement: CompiledStatement) => Promise<Record<string, unknown>[]>;
};

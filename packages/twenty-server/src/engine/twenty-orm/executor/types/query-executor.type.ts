import { type CompiledStatement } from 'src/engine/twenty-orm/sql/utils/compile-named-parameters.util';

export type QueryExecutor = {
  execute: <TRow extends Record<string, unknown> = Record<string, unknown>>(
    statement: CompiledStatement,
  ) => Promise<TRow[]>;
};

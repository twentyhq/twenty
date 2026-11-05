import { type CompiledStatement } from 'src/engine/workspace-query-executor/utils/compile-named-parameters.util';

export type QueryExecutor = {
  execute: <TRow extends Record<string, unknown> = Record<string, unknown>>(
    statement: CompiledStatement,
  ) => Promise<TRow[]>;
};

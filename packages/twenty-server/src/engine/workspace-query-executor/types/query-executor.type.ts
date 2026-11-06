import { type CompiledStatement } from 'src/engine/workspace-query-executor/utils/compile-named-parameters.util';

export type QueryExecutor = {
  execute: (statement: CompiledStatement) => Promise<Record<string, unknown>[]>;
};

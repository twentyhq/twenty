import { toTwentyOrmException } from 'src/engine/twenty-orm/utils/to-twenty-orm-exception.util';
import { type QueryExecutor } from 'src/engine/workspace-query-executor/types/query-executor.type';
import { type CompiledStatement } from 'src/engine/workspace-query-executor/utils/compile-named-parameters.util';

export class TwentyOrmQueryExecutor implements QueryExecutor {
  private readonly executor: QueryExecutor;

  constructor({ executor }: { executor: QueryExecutor }) {
    this.executor = executor;
  }

  async execute(
    statement: CompiledStatement,
  ): Promise<Record<string, unknown>[]> {
    try {
      return await this.executor.execute(statement);
    } catch (error) {
      throw toTwentyOrmException(error);
    }
  }
}

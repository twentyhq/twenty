/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type RecordPermissionQuery } from 'src/engine/permissions/internal/record-permission-orm/types/record-permission-query.type';
import {
  RecordShareException,
  RecordShareExceptionCode,
} from 'src/engine/permissions/record-share/record-share.exception';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { WorkspaceQueryExecutorService } from 'src/engine/workspace-query-executor/services/workspace-query-executor.service';
import { compileTwentyOrmStatement } from 'src/engine/twenty-orm/utils/compile-twenty-orm-statement.util';
import { toTwentyOrmException } from 'src/engine/twenty-orm/utils/to-twenty-orm-exception.util';
import { type CompiledStatement } from 'src/engine/workspace-query-executor/utils/compile-named-parameters.util';

@Injectable()
export class RecordPermissionQueryService {
  constructor(
    private readonly workspaceQueryExecutorService: WorkspaceQueryExecutorService,
  ) {}

  async execute<
    TRow extends Record<string, unknown> = Record<string, unknown>,
  >({
    workspaceId,
    transactionScope,
    query,
  }: {
    workspaceId: string;
    transactionScope?: RecordPermissionTransactionScope;
    query: RecordPermissionQuery;
  }): Promise<TRow[]> {
    const statement = compileTwentyOrmStatement(query.sql, query.parameters);

    if (
      isDefined(transactionScope) &&
      transactionScope.workspaceId !== workspaceId
    ) {
      throw new RecordShareException(
        `Transaction scope of workspace ${transactionScope.workspaceId} cannot read record permission data of workspace ${workspaceId}`,
        RecordShareExceptionCode.TRANSACTION_SCOPE_WORKSPACE_MISMATCH,
      );
    }

    const rows = await this.executeStatement({ statement, transactionScope });

    return rows as TRow[];
  }

  private async executeStatement({
    statement,
    transactionScope,
  }: {
    statement: CompiledStatement;
    transactionScope?: RecordPermissionTransactionScope;
  }): Promise<Record<string, unknown>[]> {
    try {
      return isDefined(transactionScope)
        ? await transactionScope.executeRawQuery(
            statement.text,
            statement.values,
          )
        : await this.workspaceQueryExecutorService
            .getPrimaryQueryExecutorOrThrow()
            .execute(statement);
    } catch (error) {
      throw toTwentyOrmException(error);
    }
  }
}

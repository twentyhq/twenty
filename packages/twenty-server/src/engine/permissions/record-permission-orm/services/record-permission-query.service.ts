/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type RecordPermissionQuery } from 'src/engine/permissions/record-permission-orm/types/record-permission-query.type';
import {
  RecordShareException,
  RecordShareExceptionCode,
} from 'src/engine/permissions/record-share/record-share.exception';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/record-permission-orm/types/record-permission-transaction-scope.type';
import { WorkspaceQueryExecutorService } from 'src/engine/workspace-query-executor/services/workspace-query-executor.service';
import { compileNamedParameters } from 'src/engine/workspace-query-executor/utils/compile-named-parameters.util';

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
    const statement = compileNamedParameters(query.sql, query.parameters);

    if (
      isDefined(transactionScope) &&
      transactionScope.workspaceId !== workspaceId
    ) {
      throw new RecordShareException(
        `Transaction scope of workspace ${transactionScope.workspaceId} cannot read record permission data of workspace ${workspaceId}`,
        RecordShareExceptionCode.TRANSACTION_SCOPE_WORKSPACE_MISMATCH,
      );
    }

    const rows = isDefined(transactionScope)
      ? await transactionScope.executeRawQuery(statement.text, statement.values)
      : await this.workspaceQueryExecutorService
          .getPrimaryQueryExecutorOrThrow()
          .execute(statement);

    return rows as TRow[];
  }
}

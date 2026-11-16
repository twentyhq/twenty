/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type RecordPermissionQuery } from 'src/engine/permissions/internal/record-permission-repository/types/record-permission-query.type';
import {
  RecordShareException,
  RecordShareExceptionCode,
} from 'src/engine/permissions/record-share/record-share.exception';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { WorkspaceQueryExecutorService } from 'src/engine/workspace-query-executor/services/workspace-query-executor.service';
import { toPermissionsException } from 'src/engine/permissions/internal/record-permission-repository/utils/to-permissions-exception.util';
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
    if (
      isDefined(transactionScope) &&
      transactionScope.workspaceId !== workspaceId
    ) {
      throw new RecordShareException(
        `Transaction scope of workspace ${transactionScope.workspaceId} cannot read record permission data of workspace ${workspaceId}`,
        RecordShareExceptionCode.TRANSACTION_SCOPE_WORKSPACE_MISMATCH,
      );
    }

    const rows = await this.executeQuery({ query, transactionScope });

    return rows as TRow[];
  }

  private async executeQuery({
    query,
    transactionScope,
  }: {
    query: RecordPermissionQuery;
    transactionScope?: RecordPermissionTransactionScope;
  }): Promise<Record<string, unknown>[]> {
    try {
      const statement = compileNamedParameters(query.sql, query.parameters);

      return isDefined(transactionScope)
        ? await transactionScope.executeRawQuery(
            statement.text,
            statement.values,
          )
        : await this.workspaceQueryExecutorService
            .getPrimaryQueryExecutorOrThrow()
            .execute(statement);
    } catch (error) {
      throw toPermissionsException(error);
    }
  }
}

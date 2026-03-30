import { Injectable } from '@nestjs/common';
import { msg } from '@lingui/core/macro';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

// Statuses that cannot be set directly via a user mutation.
const BLOCKED_TARGET_STATUSES = new Set(['SUPERSEDED']);

// Valid transitions: [fromStatus, toStatus]
const ALLOWED_TRANSITIONS: Array<[string, string]> = [
  ['DRAFT', 'SENT'],
  ['SENT', 'ACCEPTED'],
  ['SENT', 'REJECTED'],
  ['ACCEPTED', 'DRAFT'],
  ['REJECTED', 'DRAFT'],
];

function isTransitionAllowed(from: string, to: string): boolean {
  return ALLOWED_TRANSITIONS.some(([f, t]) => f === from && t === to);
}

@WorkspaceQueryHook('quote.updateOne')
@Injectable()
export class QuoteUpdateOnePreQueryHook implements WorkspacePreQueryHookInstance {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs,
  ): Promise<UpdateOneResolverArgs> {
    if (!('status' in payload.data)) {
      return payload;
    }

    const targetStatus = payload.data['status'] as string;

    if (BLOCKED_TARGET_STATUSES.has(targetStatus)) {
      throw new CommonQueryRunnerException(
        `Quote status cannot be manually set to ${targetStatus}`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
        {
          userFriendlyMessage: msg`This status can only be set by the system.`,
        },
      );
    }

    const schema = getWorkspaceSchemaName(authContext.workspace.id);

    const rows: Array<{ status: string }> = await this.dataSource.query(
      `SELECT "status" FROM ${schema}."_quote"
       WHERE "id" = $1 AND "deletedAt" IS NULL`,
      [payload.id],
    );

    if (rows.length === 0) {
      throw new CommonQueryRunnerException(
        `Quote ${payload.id} not found`,
        CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND,
        { userFriendlyMessage: msg`Quote not found.` },
      );
    }

    const currentStatus = rows[0].status;

    if (!isTransitionAllowed(currentStatus, targetStatus)) {
      throw new CommonQueryRunnerException(
        `Cannot transition quote from ${currentStatus} to ${targetStatus}`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
        {
          userFriendlyMessage: msg`This status transition is not allowed.`,
        },
      );
    }

    // DRAFT → SENT requires at least one section that contains at least one line item.
    if (currentStatus === 'DRAFT' && targetStatus === 'SENT') {
      await this.requireSectionWithLineItem(schema, payload.id);
    }

    return payload;
  }

  private async requireSectionWithLineItem(
    schema: string,
    quoteId: string,
  ): Promise<void> {
    const result: Array<{ count: string }> = await this.dataSource.query(
      `SELECT COUNT(*) AS count
       FROM ${schema}."_quoteSection" qs
       WHERE qs."quoteId" = $1
         AND qs."deletedAt" IS NULL
         AND EXISTS (
           SELECT 1 FROM ${schema}."_lineItem" li
           WHERE li."quoteSectionId" = qs."id"
             AND li."deletedAt" IS NULL
         )`,
      [quoteId],
    );

    const sectionCount = parseInt(result[0].count, 10);

    if (sectionCount === 0) {
      throw new CommonQueryRunnerException(
        `Quote ${quoteId} has no sections with line items — cannot be sent`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
        {
          userFriendlyMessage: msg`A quote must have at least one section containing a line item before it can be sent.`,
        },
      );
    }
  }
}

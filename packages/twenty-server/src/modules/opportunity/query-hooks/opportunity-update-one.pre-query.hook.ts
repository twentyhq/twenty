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
import { StateTransitionValidatorService } from 'src/engine/core-modules/state-transition/state-transition-validator.service';
import { type StateTransitionConfig } from 'src/engine/core-modules/state-transition/types/state-transition-config.type';

// Columns returned by the validation query (used by contract tests).
// Relations are verified via JOIN (not plain column fetch) so that
// soft-deleted related records are treated as missing.
export const OPPORTUNITY_VALIDATION_COLUMNS = ['"stage"', '"companyId"'];

// To add a rule: append to this array. No other changes needed.
export const OPPORTUNITY_TRANSITION_CONFIG: StateTransitionConfig = {
  objectName: 'opportunity',
  stageFieldName: 'stage',
  rules: [
    {
      // Must have a linked Client Account to reach Quote Requested or beyond
      // DB values: QUOTING = "Quote requested", PROPOSAL_SUBMITTED, CLOSEDWON = "Closed - Won"
      toStages: ['QUOTING', 'PROPOSAL_SUBMITTED', 'CLOSEDWON'],
      fields: [
        {
          name: 'companyId',
          condition: { type: 'nonEmpty' },
          message:
            'A Client Account must be linked before advancing to this stage.',
        },
      ],
    },
  ],
};

@WorkspaceQueryHook('opportunity.updateOne')
@Injectable()
export class OpportunityUpdateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly stateTransitionValidatorService: StateTransitionValidatorService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs,
  ): Promise<UpdateOneResolverArgs> {
    if (!('stage' in payload.data)) {
      return payload;
    }

    const targetStage = payload.data['stage'] as string;
    const schemaName = getWorkspaceSchemaName(authContext.workspace.id);

    // LEFT JOIN company so that a soft-deleted company is treated as no
    // company (c."id" will be NULL if the company row has deletedAt set).
    const rows: Array<Record<string, unknown>> = await this.dataSource.query(
      `SELECT o."stage", c."id" AS "companyId"
       FROM ${schemaName}."opportunity" o
       LEFT JOIN ${schemaName}."company" c
         ON c."id" = o."companyId" AND c."deletedAt" IS NULL
       WHERE o."id" = $1 AND o."deletedAt" IS NULL`,
      [payload.id],
    );

    if (rows.length === 0) {
      throw new CommonQueryRunnerException(
        `Opportunity ${payload.id} not found`,
        CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND,
        { userFriendlyMessage: msg`Opportunity not found.` },
      );
    }

    this.stateTransitionValidatorService.validate(
      OPPORTUNITY_TRANSITION_CONFIG,
      rows[0],
      targetStage,
    );

    return payload;
  }
}

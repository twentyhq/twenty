/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { RecordPermissionQueryService } from 'src/engine/permissions/internal/record-permission-repository/services/record-permission-query.service';
import { buildWorkspaceTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-workspace-table-expression.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export type WorkspaceMemberRelationValueLookup = {
  workspaceMemberFlatObjectMetadata: FlatObjectMetadata;
  relatedFlatObjectMetadata: FlatObjectMetadata;
  workspaceMemberColumnName: string;
  relatedColumnName: string;
  valueColumnName: string;
};

export type WorkspaceMemberRelationValueRow = {
  lookupIndex: number;
  workspaceMemberId: string;
  values: string[];
};

@Injectable()
export class WorkspaceMemberRelationValueRepository {
  constructor(
    private readonly recordPermissionQueryService: RecordPermissionQueryService,
  ) {}

  async findValuesByWorkspaceMemberId({
    workspaceId,
    lookups,
  }: {
    workspaceId: string;
    lookups: WorkspaceMemberRelationValueLookup[];
  }): Promise<WorkspaceMemberRelationValueRow[]> {
    if (lookups.length === 0) {
      return [];
    }

    return this.recordPermissionQueryService.execute<WorkspaceMemberRelationValueRow>(
      {
        workspaceId,
        query: {
          sql: lookups
            .map((lookup, lookupIndex) => {
              const relatedValueColumn = `"related".${escapeIdentifier(lookup.valueColumnName)}`;

              return `SELECT ${lookupIndex} AS "lookupIndex", "member"."id" AS "workspaceMemberId", array_agg(DISTINCT CAST(${relatedValueColumn} AS text)) AS "values"
              FROM ${buildWorkspaceTableExpression({
                workspaceId,
                tableName: computeObjectTargetTable(
                  lookup.workspaceMemberFlatObjectMetadata,
                ),
              })} AS "member"
              JOIN ${buildWorkspaceTableExpression({
                workspaceId,
                tableName: computeObjectTargetTable(
                  lookup.relatedFlatObjectMetadata,
                ),
              })} AS "related"
                ON "related".${escapeIdentifier(lookup.relatedColumnName)} = "member".${escapeIdentifier(lookup.workspaceMemberColumnName)}
              WHERE "member"."deletedAt" IS NULL
                AND "related"."deletedAt" IS NULL
                AND ${relatedValueColumn} IS NOT NULL
              GROUP BY "member"."id"`;
            })
            .join(' UNION ALL '),
          parameters: {},
        },
      },
    );
  }
}

/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { RecordPermissionQueryService } from 'src/engine/permissions/internal/record-permission-repository/services/record-permission-query.service';
import { buildWorkspaceTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-workspace-table-expression.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

@Injectable()
export class WorkspaceMemberRelationValueRepository {
  constructor(
    private readonly recordPermissionQueryService: RecordPermissionQueryService,
  ) {}

  async findValuesByWorkspaceMemberId({
    workspaceId,
    workspaceMemberFlatObjectMetadata,
    relatedFlatObjectMetadata,
    workspaceMemberColumnName,
    relatedColumnName,
    valueColumnName,
    filterColumnName,
    filterValues,
  }: {
    workspaceId: string;
    workspaceMemberFlatObjectMetadata: FlatObjectMetadata;
    relatedFlatObjectMetadata: FlatObjectMetadata;
    workspaceMemberColumnName: string;
    relatedColumnName: string;
    valueColumnName: string;
    filterColumnName: string | null;
    filterValues: string[];
  }): Promise<Map<string, string[]>> {
    const relatedValueColumn = `"related".${escapeIdentifier(valueColumnName)}`;
    const rows = await this.recordPermissionQueryService.execute<{
      workspaceMemberId: string;
      values: string[];
    }>({
      workspaceId,
      query: {
        sql: `SELECT "member"."id" AS "workspaceMemberId", array_agg(DISTINCT CAST(${relatedValueColumn} AS text)) AS "values"
          FROM ${buildWorkspaceTableExpression({
            workspaceId,
            tableName: computeObjectTargetTable(
              workspaceMemberFlatObjectMetadata,
            ),
          })} AS "member"
          JOIN ${buildWorkspaceTableExpression({
            workspaceId,
            tableName: computeObjectTargetTable(relatedFlatObjectMetadata),
          })} AS "related"
            ON "related".${escapeIdentifier(relatedColumnName)} = "member".${escapeIdentifier(workspaceMemberColumnName)}
          WHERE "member"."deletedAt" IS NULL
            AND "related"."deletedAt" IS NULL
            AND ${relatedValueColumn} IS NOT NULL
            ${
              isDefined(filterColumnName)
                ? `AND CAST("related".${escapeIdentifier(filterColumnName)} AS text) = ANY(CAST(:filterValues AS text[]))`
                : ''
            }
          GROUP BY "member"."id"`,
        parameters: { filterValues },
      },
    });

    return new Map(
      rows.map(({ workspaceMemberId, values }) => [workspaceMemberId, values]),
    );
  }
}

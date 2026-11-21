/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { type AccessGroup } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { type AccessGroupWithoutCompactId } from 'src/engine/permissions/internal/access-group/types/access-group-without-compact-id.type';
import { RecordPermissionQueryService } from 'src/engine/permissions/internal/record-permission-repository/services/record-permission-query.service';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { buildAccessGroupTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-access-group-table-expression.util';
import { type AccessGroupRow } from 'src/engine/permissions/internal/record-permission-repository/types/access-group-row.type';
import { fromAccessGroupRowToAccessGroup } from 'src/engine/permissions/internal/record-permission-repository/utils/from-access-group-row-to-access-group.util';

const INSERT_BATCH_SIZE = 500;

@Injectable()
export class AccessGroupRepository {
  constructor(
    private readonly recordPermissionQueryService: RecordPermissionQueryService,
  ) {}

  async findAccessGroups(
    workspaceId: string,
  ): Promise<Pick<AccessGroup, 'groupHash' | 'objectMetadataId'>[]> {
    return this.recordPermissionQueryService.execute<
      Pick<AccessGroup, 'groupHash' | 'objectMetadataId'>
    >({
      workspaceId,
      query: {
        sql: `SELECT "groupHash", "objectMetadataId" FROM ${buildAccessGroupTableExpression(workspaceId)}`,
        parameters: {},
      },
    });
  }

  async findAccessGroupsOfObjects({
    workspaceId,
    objectMetadataIds,
    transactionScope,
  }: {
    workspaceId: string;
    objectMetadataIds: string[];
    transactionScope?: RecordPermissionTransactionScope;
  }): Promise<AccessGroup[]> {
    const rows =
      await this.recordPermissionQueryService.execute<AccessGroupRow>({
        workspaceId,
        transactionScope,
        query: {
          sql: `SELECT "compactId", "groupHash", "objectMetadataId", "type", "ruleShapeHash", "unreadableFieldIds", "memberFieldValues", "value"
            FROM ${buildAccessGroupTableExpression(workspaceId)}
            WHERE "objectMetadataId" = ANY(:objectMetadataIds)
            ORDER BY "compactId"`,
          parameters: { objectMetadataIds },
        },
      });

    return rows.map(fromAccessGroupRowToAccessGroup);
  }

  async insertAccessGroups({
    workspaceId,
    newAccessGroups,
  }: {
    workspaceId: string;
    newAccessGroups: AccessGroupWithoutCompactId[];
  }): Promise<void> {
    for (
      let start = 0;
      start < newAccessGroups.length;
      start += INSERT_BATCH_SIZE
    ) {
      const batch = newAccessGroups.slice(start, start + INSERT_BATCH_SIZE);

      await this.recordPermissionQueryService.execute({
        workspaceId,
        query: {
          sql: `INSERT INTO ${buildAccessGroupTableExpression(workspaceId)}
            ("objectMetadataId", "type", "ruleShapeHash", "unreadableFieldIds", "memberFieldValues", "value", "groupHash")
            VALUES ${batch
              .map(
                (_, index) =>
                  `(:objectMetadataId${index}, :type${index}, :ruleShapeHash${index}, CAST(:unreadableFieldIds${index} AS uuid[]), CAST(:memberFieldValues${index} AS jsonb), :value${index}, :groupHash${index})`,
              )
              .join(', ')}
            ON CONFLICT DO NOTHING`,
          parameters: Object.fromEntries(
            batch.flatMap((newAccessGroup, index) => [
              [`objectMetadataId${index}`, newAccessGroup.objectMetadataId],
              [`type${index}`, newAccessGroup.type],
              [`ruleShapeHash${index}`, newAccessGroup.ruleShapeHash],
              [`unreadableFieldIds${index}`, newAccessGroup.unreadableFieldIds],
              [
                `memberFieldValues${index}`,
                newAccessGroup.type === 'RLS_MEMBER_VALUE'
                  ? JSON.stringify(newAccessGroup.memberFieldValues)
                  : null,
              ],
              [
                `value${index}`,
                newAccessGroup.type === 'RLS_LITERAL_VALUE'
                  ? newAccessGroup.value
                  : null,
              ],
              [`groupHash${index}`, newAccessGroup.groupHash],
            ]),
          ),
        },
      });
    }
  }

  async deleteAccessGroups({
    workspaceId,
    groupHashes,
  }: {
    workspaceId: string;
    groupHashes: string[];
  }): Promise<void> {
    await this.recordPermissionQueryService.execute({
      workspaceId,
      query: {
        sql: `DELETE FROM ${buildAccessGroupTableExpression(workspaceId)} WHERE "groupHash" = ANY(:groupHashes)`,
        parameters: { groupHashes },
      },
    });
  }
}

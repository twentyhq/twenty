/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type AccessGroupWithoutCompactId } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { RecordPermissionQueryService } from 'src/engine/permissions/internal/record-permission-repository/services/record-permission-query.service';
import { buildWorkspaceTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-workspace-table-expression.util';

const INSERT_BATCH_SIZE = 500;

const buildAccessGroupTableExpression = (workspaceId: string): string =>
  buildWorkspaceTableExpression({ workspaceId, tableName: 'accessGroup' });

@Injectable()
export class AccessGroupRepository {
  constructor(
    private readonly recordPermissionQueryService: RecordPermissionQueryService,
  ) {}

  async findGroupHashes(workspaceId: string): Promise<string[]> {
    const rows = await this.recordPermissionQueryService.execute<{
      groupHash: string;
    }>({
      workspaceId,
      query: {
        sql: `SELECT "groupHash" FROM ${buildAccessGroupTableExpression(workspaceId)}`,
        parameters: {},
      },
    });

    return rows.map(({ groupHash }) => groupHash);
  }

  async findCompactIdsByGroupHashes({
    workspaceId,
    groupHashes,
  }: {
    workspaceId: string;
    groupHashes: string[];
  }): Promise<number[]> {
    const rows = await this.recordPermissionQueryService.execute<{
      compactId: number;
    }>({
      workspaceId,
      query: {
        sql: `SELECT "compactId" FROM ${buildAccessGroupTableExpression(workspaceId)} WHERE "groupHash" = ANY(:groupHashes)`,
        parameters: { groupHashes },
      },
    });

    return rows.map(({ compactId }) => compactId);
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
            ("roleId", "objectMetadataId", "rowLevelPermissionPredicateGroupId", "memberFieldValues", "groupHash")
            VALUES ${batch
              .map(
                (_, index) =>
                  `(:roleId${index}, :objectMetadataId${index}, :ruleId${index}, CAST(:memberFieldValues${index} AS jsonb), :groupHash${index})`,
              )
              .join(', ')}
            ON CONFLICT DO NOTHING`,
          parameters: Object.fromEntries(
            batch.flatMap((newAccessGroup, index) => [
              [`roleId${index}`, newAccessGroup.roleId],
              [`objectMetadataId${index}`, newAccessGroup.objectMetadataId],
              [
                `ruleId${index}`,
                newAccessGroup.rowLevelPermissionPredicateGroupId,
              ],
              [
                `memberFieldValues${index}`,
                isDefined(newAccessGroup.memberFieldValues)
                  ? JSON.stringify(newAccessGroup.memberFieldValues)
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

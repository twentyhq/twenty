/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type AccessGroup } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { type AccessGroupWithoutCompactId } from 'src/engine/permissions/internal/access-group/types/access-group-without-compact-id.type';
import { RecordPermissionQueryService } from 'src/engine/permissions/internal/record-permission-repository/services/record-permission-query.service';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { buildAccessGroupTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-access-group-table-expression.util';
import { type AccessGroupRow } from 'src/engine/permissions/internal/record-permission-repository/types/access-group-row.type';
import { findAccessGroupTypeHandler } from 'src/engine/permissions/internal/access-group/utils/find-access-group-type-handler.util';
import { fromAccessGroupRowToAccessGroup } from 'src/engine/permissions/internal/record-permission-repository/utils/from-access-group-row-to-access-group.util';

const INSERT_BATCH_SIZE = 500;

type StoredAccessGroupKey = Pick<
  AccessGroup,
  'compactId' | 'groupHash' | 'objectMetadataId' | 'ruleShapeHash'
>;

@Injectable()
export class AccessGroupRepository {
  constructor(
    private readonly recordPermissionQueryService: RecordPermissionQueryService,
  ) {}

  async findAccessGroups(workspaceId: string): Promise<StoredAccessGroupKey[]> {
    return this.recordPermissionQueryService.execute<StoredAccessGroupKey>({
      workspaceId,
      query: {
        sql: `SELECT "compactId", "groupHash", "objectMetadataId", "ruleShapeHash" FROM ${buildAccessGroupTableExpression(workspaceId)}`,
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
  }): Promise<AccessGroup[]> {
    const insertedAccessGroups: AccessGroup[] = [];

    for (
      let start = 0;
      start < newAccessGroups.length;
      start += INSERT_BATCH_SIZE
    ) {
      const batch = newAccessGroups.slice(start, start + INSERT_BATCH_SIZE);

      const insertedRows =
        await this.recordPermissionQueryService.execute<AccessGroupRow>({
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
            ON CONFLICT DO NOTHING
            RETURNING "compactId", "groupHash", "objectMetadataId", "type", "ruleShapeHash", "unreadableFieldIds", "memberFieldValues", "value"`,
            parameters: Object.fromEntries(
              batch.flatMap((newAccessGroup, index) => {
                const { memberFieldValues, value } = findAccessGroupTypeHandler(
                  newAccessGroup.type,
                ).toRowColumns(newAccessGroup);

                return [
                  [`objectMetadataId${index}`, newAccessGroup.objectMetadataId],
                  [`type${index}`, newAccessGroup.type],
                  [`ruleShapeHash${index}`, newAccessGroup.ruleShapeHash],
                  [
                    `unreadableFieldIds${index}`,
                    newAccessGroup.unreadableFieldIds,
                  ],
                  [
                    `memberFieldValues${index}`,
                    isDefined(memberFieldValues)
                      ? JSON.stringify(memberFieldValues)
                      : null,
                  ],
                  [`value${index}`, value],
                  [`groupHash${index}`, newAccessGroup.groupHash],
                ];
              }),
            ),
          },
        });

      insertedAccessGroups.push(
        ...insertedRows.map(fromAccessGroupRowToAccessGroup),
      );
    }

    return insertedAccessGroups;
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

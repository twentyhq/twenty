/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  type AccessGroup,
  type AccessGroupWithoutCompactId,
} from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { type AccessGroupFamily } from 'src/engine/permissions/internal/access-group/types/access-group-family.type';
import { type RlsMemberFieldValues } from 'src/engine/permissions/internal/rls/types/rls-member-field-values.type';
import { RecordPermissionQueryService } from 'src/engine/permissions/internal/record-permission-repository/services/record-permission-query.service';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { buildAccessGroupTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-access-group-table-expression.util';

const INSERT_BATCH_SIZE = 500;

@Injectable()
export class AccessGroupRepository {
  constructor(
    private readonly recordPermissionQueryService: RecordPermissionQueryService,
  ) {}

  async findAccessGroups(
    workspaceId: string,
  ): Promise<
    Pick<
      AccessGroup,
      | 'compactId'
      | 'groupHash'
      | 'objectMetadataId'
      | 'rowLevelPermissionPredicateGroupId'
    >[]
  > {
    return this.recordPermissionQueryService.execute({
      workspaceId,
      query: {
        sql: `SELECT "compactId", "groupHash", "objectMetadataId", "rowLevelPermissionPredicateGroupId" FROM ${buildAccessGroupTableExpression(workspaceId)}`,
        parameters: {},
      },
    });
  }

  async findAccessGroupsOfObjectOutsideFamilies({
    workspaceId,
    objectMetadataId,
    familyRuleIds,
    transactionScope,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    familyRuleIds: string[];
    transactionScope?: RecordPermissionTransactionScope;
  }): Promise<AccessGroup[]> {
    return this.recordPermissionQueryService.execute<AccessGroup>({
      workspaceId,
      transactionScope,
      query: {
        sql: `SELECT "compactId", "groupHash", "roleId", "objectMetadataId", "rowLevelPermissionPredicateGroupId", "memberFieldValues"
          FROM ${buildAccessGroupTableExpression(workspaceId)}
          WHERE "objectMetadataId" = :objectMetadataId
            AND ("rowLevelPermissionPredicateGroupId" IS NULL OR NOT ("rowLevelPermissionPredicateGroupId" = ANY(CAST(:familyRuleIds AS uuid[]))))
          ORDER BY "compactId"`,
        parameters: { objectMetadataId, familyRuleIds },
      },
    });
  }

  async findAccessGroupFamilyResidualMemberFieldValues({
    workspaceId,
    families,
    transactionScope,
  }: {
    workspaceId: string;
    families: AccessGroupFamily[];
    transactionScope?: RecordPermissionTransactionScope;
  }): Promise<RlsMemberFieldValues[][]> {
    if (families.length === 0) {
      return [];
    }

    const rows = await this.recordPermissionQueryService.execute<{
      familyIndex: number;
      residualMemberFieldValues: RlsMemberFieldValues;
    }>({
      workspaceId,
      transactionScope,
      query: {
        sql: families
          .map(
            (_, familyIndex) =>
              `SELECT DISTINCT ${familyIndex} AS "familyIndex", "memberFieldValues" - CAST(:keys_${familyIndex} AS text[]) AS "residualMemberFieldValues"
              FROM ${buildAccessGroupTableExpression(workspaceId)}
              WHERE "rowLevelPermissionPredicateGroupId" = :ruleId_${familyIndex}
                AND "roleId" = :roleId_${familyIndex}
                AND "objectMetadataId" = :objectMetadataId_${familyIndex}
                AND "memberFieldValues" IS NOT NULL`,
          )
          .join(' UNION ALL '),
        parameters: Object.fromEntries(
          families.flatMap((family, familyIndex) => [
            [
              `keys_${familyIndex}`,
              family.keys.map(({ memberFieldKey }) => memberFieldKey),
            ],
            [`ruleId_${familyIndex}`, family.ruleId],
            [`roleId_${familyIndex}`, family.roleId],
            [`objectMetadataId_${familyIndex}`, family.objectMetadataId],
          ]),
        ),
      },
    });

    return families.map((_, familyIndex) =>
      rows
        .filter((row) => Number(row.familyIndex) === familyIndex)
        .map(({ residualMemberFieldValues }) => residualMemberFieldValues),
    );
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

      const insertedRows = await this.recordPermissionQueryService.execute<{
        compactId: number;
        groupHash: string;
      }>({
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
            ON CONFLICT DO NOTHING
            RETURNING "compactId", "groupHash"`,
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
      const compactIdByGroupHash = new Map(
        insertedRows.map(({ compactId, groupHash }) => [groupHash, compactId]),
      );

      insertedAccessGroups.push(
        ...batch.flatMap((newAccessGroup) => {
          const compactId = compactIdByGroupHash.get(newAccessGroup.groupHash);

          return isDefined(compactId) ? [{ ...newAccessGroup, compactId }] : [];
        }),
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

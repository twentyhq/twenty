/* @license Enterprise */

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type AccessGroupFamily } from 'src/engine/permissions/internal/access-group/types/access-group-family.type';
import { type RecordAccessGroupSQLConditionMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-sql-condition-metadata-maps.type';
import { buildRuleSQLConditionOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-rule-sql-condition-or-throw.util';
import { RECORD_ACCESS_GROUP_TABLE_ALIAS } from 'src/engine/permissions/internal/record-permission-repository/constants/record-access-group-table-alias.constant';
import { buildAccessGroupFamilyIdsExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-access-group-family-ids-expression.util';
import { type RlsMemberFieldValues } from 'src/engine/permissions/internal/rls/types/rls-member-field-values.type';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';

export const buildAccessGroupFamilyIdsExpressions = ({
  workspaceId,
  flatObjectMetadata,
  metadataMaps,
  families,
  residualMemberFieldValuesByFamily,
}: {
  workspaceId: string;
  flatObjectMetadata: FlatObjectMetadata;
  metadataMaps: RecordAccessGroupSQLConditionMetadataMaps;
  families: AccessGroupFamily[];
  residualMemberFieldValuesByFamily: RlsMemberFieldValues[][];
}): SQLCondition[] =>
  families
    .flatMap((family, familyIndex) =>
      (residualMemberFieldValuesByFamily[familyIndex] ?? []).map(
        (residualMemberFieldValues) => ({ family, residualMemberFieldValues }),
      ),
    )
    .map(({ family, residualMemberFieldValues }, familyIndex) =>
      buildAccessGroupFamilyIdsExpression({
        workspaceId,
        tableAlias: RECORD_ACCESS_GROUP_TABLE_ALIAS,
        family,
        familyIndex,
        residualMemberFieldValues,
        residualSQLCondition: buildRuleSQLConditionOrThrow({
          rowLevelPermissionRule: family.residualRule,
          memberFieldValues: residualMemberFieldValues,
          flatObjectMetadata,
          tableAlias: RECORD_ACCESS_GROUP_TABLE_ALIAS,
          metadataMaps,
        }),
      }),
    );

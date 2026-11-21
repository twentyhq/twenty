/* @license Enterprise */

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type AccessGroupValueLookup } from 'src/engine/permissions/internal/access-group/types/access-group-value-lookup.type';
import { type RecordAccessGroupSQLConditionMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-sql-condition-metadata-maps.type';
import { buildRlsRuleSQLCondition } from 'src/engine/permissions/internal/access-group/utils/build-rls-rule-sql-condition.util';
import { RECORD_ACCESS_GROUP_TABLE_ALIAS } from 'src/engine/permissions/internal/record-permission-repository/constants/record-access-group-table-alias.constant';
import { buildAccessGroupValueLookupIdsExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-access-group-value-lookup-ids-expression.util';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';

export const buildAccessGroupValueLookupIdsExpressions = ({
  workspaceId,
  flatObjectMetadata,
  metadataMaps,
  lookups,
}: {
  workspaceId: string;
  flatObjectMetadata: FlatObjectMetadata;
  metadataMaps: RecordAccessGroupSQLConditionMetadataMaps;
  lookups: AccessGroupValueLookup[];
}): SQLCondition[] =>
  lookups.map((lookup, lookupIndex) =>
    buildAccessGroupValueLookupIdsExpression({
      workspaceId,
      tableAlias: RECORD_ACCESS_GROUP_TABLE_ALIAS,
      lookup,
      lookupIndex,
      residualSQLCondition: buildRlsRuleSQLCondition({
        rowLevelPermissionRule: lookup.residualRule,
        memberFieldValues: {},
        flatObjectMetadata,
        tableAlias: RECORD_ACCESS_GROUP_TABLE_ALIAS,
        metadataMaps,
      }),
    }),
  );

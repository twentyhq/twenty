import { isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { buildRowLevelPermissionRecordFilterForParent } from 'src/engine/twenty-orm/utils/build-row-level-permission-record-filter-for-parent.util';
import { renderRowLevelPermissionFilterToSql } from 'src/engine/twenty-orm/utils/render-row-level-permission-filter-to-sql.util';

export type CompiledSharingRuleCriteria = {
  sql: string;
  parameters: ObjectLiteral;
};

export const SHARING_RULE_MATCH_ALL_SQL = 'TRUE';
export const SHARING_RULE_MATCH_NONE_SQL = 'FALSE';

export const compileSharingRuleCriteriaToSql = ({
  sharingRuleId,
  tableAlias,
  objectMetadata,
  flatFieldMetadataMaps,
  flatRowLevelPermissionPredicateMaps,
  flatRowLevelPermissionPredicateGroupMaps,
}: {
  sharingRuleId: string;
  tableAlias: string;
  objectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatRowLevelPermissionPredicateMaps: FlatRowLevelPermissionPredicateMaps;
  flatRowLevelPermissionPredicateGroupMaps: FlatRowLevelPermissionPredicateGroupMaps;
}): CompiledSharingRuleCriteria => {
  const hasCriteria = Object.values(
    flatRowLevelPermissionPredicateMaps.byUniversalIdentifier,
  ).some(
    (predicate) =>
      isDefined(predicate) &&
      predicate.sharingRuleId === sharingRuleId &&
      predicate.objectMetadataId === objectMetadata.id &&
      !isDefined(predicate.deletedAt),
  );

  if (!hasCriteria) {
    return { sql: SHARING_RULE_MATCH_ALL_SQL, parameters: {} };
  }

  const recordFilter = buildRowLevelPermissionRecordFilterForParent({
    parent: { roleId: null, sharingRuleId },
    objectMetadata,
    flatFieldMetadataMaps,
    flatRowLevelPermissionPredicateMaps,
    flatRowLevelPermissionPredicateGroupMaps,
  });

  const renderedCondition = isDefined(recordFilter)
    ? renderRowLevelPermissionFilterToSql({
        recordFilter,
        tableAlias,
        objectMetadata,
        flatFieldMetadataMaps,
      })
    : null;

  return (
    renderedCondition ?? {
      sql: SHARING_RULE_MATCH_NONE_SQL,
      parameters: {},
    }
  );
};

import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatSharingRuleMaps } from 'src/engine/metadata-modules/flat-sharing-rule/types/flat-sharing-rule-maps.type';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';

export const resolveSharingRuleIdsAffectedByRecordEvents = ({
  objectMetadataId,
  action,
  events,
  flatSharingRuleMaps,
  flatRowLevelPermissionPredicateMaps,
  flatFieldMetadataMaps,
}: {
  objectMetadataId: string;
  action: DatabaseEventAction;
  events: ObjectRecordBaseEvent[];
  flatSharingRuleMaps: FlatSharingRuleMaps;
  flatRowLevelPermissionPredicateMaps: FlatRowLevelPermissionPredicateMaps;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): string[] => {
  const activeSharingRules = Object.values(
    flatSharingRuleMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(
      (sharingRule) =>
        sharingRule.objectMetadataId === objectMetadataId &&
        sharingRule.isActive &&
        !isDefined(sharingRule.deletedAt),
    );

  if (activeSharingRules.length === 0) {
    return [];
  }

  if (
    action === DatabaseEventAction.CREATED ||
    action === DatabaseEventAction.RESTORED
  ) {
    return activeSharingRules.map((sharingRule) => sharingRule.id);
  }

  if (action !== DatabaseEventAction.UPDATED) {
    return [];
  }

  const updatedFieldNames = new Set(
    events.flatMap((event) => event.properties.updatedFields ?? []),
  );

  if (updatedFieldNames.size === 0) {
    return [];
  }

  const criteriaFieldNamesBySharingRuleId = new Map<string, Set<string>>();

  for (const predicate of Object.values(
    flatRowLevelPermissionPredicateMaps.byUniversalIdentifier,
  )) {
    if (
      !isDefined(predicate) ||
      !isDefined(predicate.sharingRuleId) ||
      isDefined(predicate.deletedAt)
    ) {
      continue;
    }

    const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: predicate.fieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(fieldMetadata)) {
      continue;
    }

    const criteriaFieldNames =
      criteriaFieldNamesBySharingRuleId.get(predicate.sharingRuleId) ??
      new Set<string>();

    criteriaFieldNames.add(fieldMetadata.name);
    criteriaFieldNamesBySharingRuleId.set(
      predicate.sharingRuleId,
      criteriaFieldNames,
    );
  }

  return activeSharingRules
    .filter((sharingRule) => {
      const criteriaFieldNames = criteriaFieldNamesBySharingRuleId.get(
        sharingRule.id,
      );

      return (
        isDefined(criteriaFieldNames) &&
        [...criteriaFieldNames].some((fieldName) =>
          updatedFieldNames.has(fieldName),
        )
      );
    })
    .map((sharingRule) => sharingRule.id);
};

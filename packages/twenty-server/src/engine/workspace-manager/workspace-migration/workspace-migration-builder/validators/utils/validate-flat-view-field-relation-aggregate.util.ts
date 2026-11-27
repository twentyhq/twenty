import { msg, t } from '@lingui/core/macro';
import { AggregateOperations } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { getAvailableAggregationsFromObjectFields } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { getInvalidFlatViewFieldRelationScopeError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-invalid-flat-view-field-relation-scope-error.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

const RELATION_AGGREGATE_OPERATIONS_ON_A_FIELD: AggregateOperations[] = [
  AggregateOperations.SUM,
  AggregateOperations.AVG,
  AggregateOperations.MIN,
  AggregateOperations.MAX,
];

// The relation target validator checks the field itself; this checks the field can take the operation
const validateRelationAggregateTarget = ({
  aggregateOperation,
  relationTargetFieldMetadataUniversalIdentifier,
  flatFieldMetadataMaps,
}: {
  aggregateOperation: AggregateOperations;
  relationTargetFieldMetadataUniversalIdentifier: string | null;
  flatFieldMetadataMaps: AllUniversalFlatEntityMaps['flatFieldMetadataMaps'];
}): FlatEntityValidationError[] => {
  if (
    aggregateOperation === AggregateOperations.COUNT &&
    isDefined(relationTargetFieldMetadataUniversalIdentifier)
  ) {
    return [
      getInvalidFlatViewFieldRelationScopeError({
        message: t`A count of related records cannot have a related record field`,
        userFriendlyMessage: msg`A count of related records cannot use a field`,
      }),
    ];
  }

  if (aggregateOperation === AggregateOperations.COUNT) {
    return [];
  }

  if (!RELATION_AGGREGATE_OPERATIONS_ON_A_FIELD.includes(aggregateOperation)) {
    return [
      getInvalidFlatViewFieldRelationScopeError({
        message: t`Only count, sum, average, min and max can aggregate related records`,
        userFriendlyMessage: msg`This calculation is not available on related records`,
      }),
    ];
  }

  if (!isDefined(relationTargetFieldMetadataUniversalIdentifier)) {
    return [
      getInvalidFlatViewFieldRelationScopeError({
        message: t`This aggregate operation requires a related record field`,
        userFriendlyMessage: msg`Pick a field of the related records to calculate on`,
      }),
    ];
  }

  const relationTargetFlatFieldMetadata = findFlatEntityByUniversalIdentifier({
    universalIdentifier: relationTargetFieldMetadataUniversalIdentifier,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(relationTargetFlatFieldMetadata)) {
    return [];
  }

  // Same source as the aggregates the API exposes on a nested connection
  const isAggregateOperationAvailable = Object.values(
    getAvailableAggregationsFromObjectFields([relationTargetFlatFieldMetadata]),
  ).some(
    (availableAggregation) =>
      availableAggregation.fromField === relationTargetFlatFieldMetadata.name &&
      availableAggregation.aggregateOperation === aggregateOperation,
  );

  return isAggregateOperationAvailable
    ? []
    : [
        getInvalidFlatViewFieldRelationScopeError({
          message: t`The related record field does not support this aggregate operation`,
          userFriendlyMessage: msg`This calculation is not available for this field`,
        }),
      ];
};

export const validateFlatViewFieldRelationAggregate = ({
  flatViewField: {
    relationTargetFieldMetadataUniversalIdentifier,
    universalRelationScope,
  },
  flatFieldMetadataMaps,
}: {
  flatViewField: Pick<
    UniversalFlatViewField,
    'relationTargetFieldMetadataUniversalIdentifier' | 'universalRelationScope'
  >;
  flatFieldMetadataMaps: AllUniversalFlatEntityMaps['flatFieldMetadataMaps'];
}): FlatEntityValidationError[] => {
  if (
    !isDefined(universalRelationScope) ||
    !isDefined(universalRelationScope.aggregateOperation)
  ) {
    return [];
  }

  // The aggregate covers every record the filters keep, so a sort or a limit would be ignored
  if (
    isNonEmptyArray(universalRelationScope.sorts) ||
    isDefined(universalRelationScope.limit)
  ) {
    return [
      getInvalidFlatViewFieldRelationScopeError({
        message: t`The relation scope of an aggregate cannot have sorts or a limit`,
        userFriendlyMessage: msg`A calculation on related records cannot be sorted or limited`,
      }),
    ];
  }

  return validateRelationAggregateTarget({
    aggregateOperation: universalRelationScope.aggregateOperation,
    relationTargetFieldMetadataUniversalIdentifier,
    flatFieldMetadataMaps,
  });
};

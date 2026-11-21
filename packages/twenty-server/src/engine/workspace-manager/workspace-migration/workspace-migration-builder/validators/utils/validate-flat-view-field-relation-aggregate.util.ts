import { msg, t } from '@lingui/core/macro';
import { AggregateOperations, RelationType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { getAvailableAggregationsFromObjectFields } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { isRelationUniversalFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-relation-universal-flat-field-metadata-of-type.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

const RELATION_AGGREGATE_OPERATIONS_ON_A_FIELD: AggregateOperations[] = [
  AggregateOperations.SUM,
  AggregateOperations.AVG,
  AggregateOperations.MIN,
  AggregateOperations.MAX,
];

const buildRelationAggregateError = ({
  message,
  userFriendlyMessage,
}: Pick<
  FlatEntityValidationError<ViewExceptionCode>,
  'message' | 'userFriendlyMessage'
>): FlatEntityValidationError<ViewExceptionCode> => ({
  code: ViewExceptionCode.INVALID_VIEW_DATA,
  message,
  userFriendlyMessage,
});

// The relation target validator checks the field itself; this checks the field can take the operation
const validateRelationAggregateTarget = ({
  relationAggregateOperation,
  relationTargetFieldMetadataUniversalIdentifier,
  flatFieldMetadataMaps,
}: {
  relationAggregateOperation: AggregateOperations;
  relationTargetFieldMetadataUniversalIdentifier: string | null;
  flatFieldMetadataMaps: AllUniversalFlatEntityMaps['flatFieldMetadataMaps'];
}): FlatEntityValidationError<ViewExceptionCode>[] => {
  if (relationAggregateOperation === AggregateOperations.COUNT) {
    return isDefined(relationTargetFieldMetadataUniversalIdentifier)
      ? [
          buildRelationAggregateError({
            message: t`A count of related records cannot have a related record field`,
            userFriendlyMessage: msg`A count of related records cannot use a field`,
          }),
        ]
      : [];
  }

  if (
    !RELATION_AGGREGATE_OPERATIONS_ON_A_FIELD.includes(
      relationAggregateOperation,
    )
  ) {
    return [
      buildRelationAggregateError({
        message: t`Only count, sum, average, min and max can aggregate related records`,
        userFriendlyMessage: msg`This calculation is not available on related records`,
      }),
    ];
  }

  if (!isDefined(relationTargetFieldMetadataUniversalIdentifier)) {
    return [
      buildRelationAggregateError({
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
    ({ fromField, aggregateOperation }) =>
      fromField === relationTargetFlatFieldMetadata.name &&
      aggregateOperation === relationAggregateOperation,
  );

  return isAggregateOperationAvailable
    ? []
    : [
        buildRelationAggregateError({
          message: t`The related record field does not support this aggregate operation`,
          userFriendlyMessage: msg`This calculation is not available for this field`,
        }),
      ];
};

export const validateFlatViewFieldRelationAggregate = ({
  flatViewField: {
    isCanonical,
    relationAggregateOperation,
    relationTargetFieldMetadataUniversalIdentifier,
    universalRelationScope,
  },
  flatFieldMetadata,
  flatFieldMetadataMaps,
}: {
  flatViewField: Pick<
    UniversalFlatViewField,
    | 'isCanonical'
    | 'relationAggregateOperation'
    | 'relationTargetFieldMetadataUniversalIdentifier'
    | 'universalRelationScope'
  >;
  flatFieldMetadata: UniversalFlatFieldMetadata;
  flatFieldMetadataMaps: AllUniversalFlatEntityMaps['flatFieldMetadataMaps'];
}): FlatEntityValidationError<ViewExceptionCode>[] => {
  if (!isDefined(relationAggregateOperation)) {
    return [];
  }

  if (isCanonical) {
    return [
      buildRelationAggregateError({
        message: t`Only non-canonical view fields can show an aggregate of related records`,
        userFriendlyMessage: msg`Only added columns can show a calculation on related records`,
      }),
    ];
  }

  if (
    !isRelationUniversalFlatFieldMetadataOfType({
      flatFieldMetadata,
      relationType: RelationType.ONE_TO_MANY,
    }) ||
    !isDefined(universalRelationScope)
  ) {
    return [
      buildRelationAggregateError({
        message: t`An aggregate of related records can only be shown on a one-to-many relation field with a relation scope`,
        userFriendlyMessage: msg`Only a filtered column of related records can show a calculation on them`,
      }),
    ];
  }

  // The aggregate covers every record the filters keep, so a sort or a limit would be ignored
  if (
    isNonEmptyArray(universalRelationScope.sorts) ||
    isDefined(universalRelationScope.limit)
  ) {
    return [
      buildRelationAggregateError({
        message: t`The relation scope of an aggregate cannot have sorts or a limit`,
        userFriendlyMessage: msg`A calculation on related records cannot be sorted or limited`,
      }),
    ];
  }

  return validateRelationAggregateTarget({
    relationAggregateOperation,
    relationTargetFieldMetadataUniversalIdentifier,
    flatFieldMetadataMaps,
  });
};

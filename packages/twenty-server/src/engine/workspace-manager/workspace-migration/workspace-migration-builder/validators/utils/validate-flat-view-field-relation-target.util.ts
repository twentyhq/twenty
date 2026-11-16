import { msg, t } from '@lingui/core/macro';
import { AggregateOperations, RelationType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { getAvailableAggregationsFromObjectFields } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { isRelationUniversalFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-relation-universal-flat-field-metadata-of-type.util';
import { resolveEffectiveUniversalFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-universal-flat-entity-property.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

const RELATION_AGGREGATE_OPERATIONS_ON_RELATION_TARGET_FIELD: AggregateOperations[] =
  [
    AggregateOperations.SUM,
    AggregateOperations.AVG,
    AggregateOperations.MIN,
    AggregateOperations.MAX,
  ];

type FlatViewFieldRelationTargetValidationArgs = {
  flatViewField: Pick<
    UniversalFlatViewField,
    | 'isCanonical'
    | 'relationTargetFieldMetadataUniversalIdentifier'
    | 'relationAggregateOperation'
  >;
  flatFieldMetadata: UniversalFlatFieldMetadata;
  flatFieldMetadataMaps: AllUniversalFlatEntityMaps['flatFieldMetadataMaps'];
};

const validateRelationTargetFlatFieldMetadata = ({
  relationTargetFlatFieldMetadata,
  flatFieldMetadata,
}: {
  relationTargetFlatFieldMetadata: UniversalFlatFieldMetadata | undefined;
  flatFieldMetadata: Pick<
    UniversalFlatFieldMetadata,
    'relationTargetObjectMetadataUniversalIdentifier'
  >;
}): FlatEntityValidationError<ViewExceptionCode>[] => {
  if (
    !isDefined(relationTargetFlatFieldMetadata) ||
    relationTargetFlatFieldMetadata.objectMetadataUniversalIdentifier !==
      flatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier
  ) {
    return [
      {
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`The related record field must belong to the relation target object`,
        userFriendlyMessage: msg`The field must belong to the related object`,
      },
    ];
  }

  if (
    !resolveEffectiveUniversalFlatEntityProperty({
      metadataName: 'fieldMetadata',
      universalFlatEntity: relationTargetFlatFieldMetadata,
      property: 'isActive',
    })
  ) {
    return [
      {
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`The related record field must be active`,
        userFriendlyMessage: msg`A deactivated field cannot be shown in a column`,
      },
    ];
  }

  if (
    isMorphOrRelationFieldMetadataType(relationTargetFlatFieldMetadata.type)
  ) {
    return [
      {
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`The related record field cannot be a relation`,
        userFriendlyMessage: msg`A related record's relation cannot be shown in a column`,
      },
    ];
  }

  return [];
};

const validateRelationLookup = ({
  flatViewField: {
    isCanonical,
    relationTargetFieldMetadataUniversalIdentifier,
  },
  flatFieldMetadata,
  flatFieldMetadataMaps,
}: FlatViewFieldRelationTargetValidationArgs): FlatEntityValidationError<ViewExceptionCode>[] => {
  if (isCanonical) {
    return [
      {
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Only non-canonical view fields can show a related record field`,
        userFriendlyMessage: msg`Only added columns can show a field of the related record`,
      },
    ];
  }

  if (
    !isRelationUniversalFlatFieldMetadataOfType({
      flatFieldMetadata,
      relationType: RelationType.MANY_TO_ONE,
    })
  ) {
    return [
      {
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`A related record field can only be shown on a many-to-one relation field`,
        userFriendlyMessage: msg`Only a column linking to one record can show a field of that record`,
      },
    ];
  }

  return validateRelationTargetFlatFieldMetadata({
    relationTargetFlatFieldMetadata: isDefined(
      relationTargetFieldMetadataUniversalIdentifier,
    )
      ? findFlatEntityByUniversalIdentifier({
          universalIdentifier: relationTargetFieldMetadataUniversalIdentifier,
          flatEntityMaps: flatFieldMetadataMaps,
        })
      : undefined,
    flatFieldMetadata,
  });
};

const validateRelationAggregate = ({
  flatViewField: {
    isCanonical,
    relationTargetFieldMetadataUniversalIdentifier,
    relationAggregateOperation,
  },
  flatFieldMetadata,
  flatFieldMetadataMaps,
}: FlatViewFieldRelationTargetValidationArgs): FlatEntityValidationError<ViewExceptionCode>[] => {
  if (isCanonical) {
    return [
      {
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Only non-canonical view fields can show an aggregate of related records`,
        userFriendlyMessage: msg`Only added columns can show a calculation on related records`,
      },
    ];
  }

  if (
    !isRelationUniversalFlatFieldMetadataOfType({
      flatFieldMetadata,
      relationType: RelationType.ONE_TO_MANY,
    })
  ) {
    return [
      {
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`An aggregate of related records can only be shown on a one-to-many relation field`,
        userFriendlyMessage: msg`Only a column linking to many records can show a calculation on them`,
      },
    ];
  }

  if (relationAggregateOperation === AggregateOperations.COUNT) {
    return isDefined(relationTargetFieldMetadataUniversalIdentifier)
      ? [
          {
            code: ViewExceptionCode.INVALID_VIEW_DATA,
            message: t`A count of related records cannot have a related record field`,
            userFriendlyMessage: msg`A count of related records cannot use a field`,
          },
        ]
      : [];
  }

  if (
    !isDefined(relationAggregateOperation) ||
    !RELATION_AGGREGATE_OPERATIONS_ON_RELATION_TARGET_FIELD.includes(
      relationAggregateOperation,
    )
  ) {
    return [
      {
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`This aggregate operation is not supported on related records`,
        userFriendlyMessage: msg`This calculation is not available on related records`,
      },
    ];
  }

  if (!isDefined(relationTargetFieldMetadataUniversalIdentifier)) {
    return [
      {
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`This aggregate operation requires a related record field`,
        userFriendlyMessage: msg`Pick a field of the related records to calculate on`,
      },
    ];
  }

  const relationTargetFlatFieldMetadata = findFlatEntityByUniversalIdentifier({
    universalIdentifier: relationTargetFieldMetadataUniversalIdentifier,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  const relationTargetErrors = validateRelationTargetFlatFieldMetadata({
    relationTargetFlatFieldMetadata,
    flatFieldMetadata,
  });

  if (
    isNonEmptyArray(relationTargetErrors) ||
    !isDefined(relationTargetFlatFieldMetadata)
  ) {
    return relationTargetErrors;
  }

  // Same source as the nested connection aggregates the API exposes per row
  const isAggregateOperationAvailable = Object.values(
    getAvailableAggregationsFromObjectFields([relationTargetFlatFieldMetadata]),
  ).some(
    ({ fromField, aggregateOperation }) =>
      fromField === relationTargetFlatFieldMetadata.name &&
      aggregateOperation === relationAggregateOperation,
  );

  if (!isAggregateOperationAvailable) {
    return [
      {
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`The related record field does not support this aggregate operation`,
        userFriendlyMessage: msg`This calculation is not available for this field`,
      },
    ];
  }

  return [];
};

export const validateFlatViewFieldRelationTarget = (
  args: FlatViewFieldRelationTargetValidationArgs,
): FlatEntityValidationError<ViewExceptionCode>[] => {
  const {
    relationTargetFieldMetadataUniversalIdentifier,
    relationAggregateOperation,
  } = args.flatViewField;

  if (isDefined(relationAggregateOperation)) {
    return validateRelationAggregate(args);
  }

  if (isDefined(relationTargetFieldMetadataUniversalIdentifier)) {
    return validateRelationLookup(args);
  }

  return [];
};

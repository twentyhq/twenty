import { msg } from '@lingui/core/macro';
import { ROLLUP_AGGREGATE_OPERATIONS } from 'twenty-shared/constants';
import {
  AggregateOperations,
  FeatureFlagKey,
  FieldMetadataType,
  RelationType,
} from 'twenty-shared/types';
import {
  computeRollupResultType,
  getFieldMetadataValueType,
  isDefined,
} from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { ROLLUP_MAX_FIELDS_PER_OBJECT } from 'src/engine/metadata-modules/flat-field-metadata/constants/rollup-max-fields-per-object.constant';
import { ROLLUP_MAX_DECIMALS } from 'src/engine/metadata-modules/flat-field-metadata/schemas/rollup-settings-input.schema';
import { type FlatFieldMetadataTypeValidationArgs } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-type-validator.type';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { findRollupFlatFieldMetadatasDependingOnFields } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-rollup-flat-field-metadatas-depending-on-fields.util';
import { getUniversalRollupSettingsFieldMetadataUniversalIdentifiers } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-universal-rollup-settings-field-metadata-universal-identifiers.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { isRelationUniversalFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-relation-universal-flat-field-metadata-of-type.util';
import { validateRollupFlatFieldMetadataFilters } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-rollup-flat-field-metadata-filters.util';

const invalidRollup = ({
  message,
  userFriendlyMessage,
}: Pick<
  FlatFieldMetadataValidationError,
  'message' | 'userFriendlyMessage'
>): FlatFieldMetadataValidationError[] => [
  {
    code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
    message,
    userFriendlyMessage,
  },
];

export const validateRollupFlatFieldMetadata = ({
  flatEntityToValidate,
  optimisticFlatEntityMapsAndRelatedFlatEntityMaps: { flatFieldMetadataMaps },
  remainingFlatEntityMapsToValidate,
  additionalCacheDataMaps,
  update,
}: FlatFieldMetadataTypeValidationArgs<FieldMetadataType.ROLLUP>): FlatFieldMetadataValidationError[] => {
  const isSettingsChange =
    !isDefined(update) || update.universalSettings !== undefined;

  if (!isSettingsChange) {
    return [];
  }

  if (
    !additionalCacheDataMaps.featureFlagsMap[
      FeatureFlagKey.IS_ROLLUP_FIELD_ENABLED
    ]
  ) {
    return invalidRollup({
      message: 'Rollup fields are not enabled on this workspace',
      userFriendlyMessage: msg`Rollup fields are not available on this workspace`,
    });
  }

  const { universalSettings } = flatEntityToValidate;

  if (
    !isDefined(universalSettings) ||
    !ROLLUP_AGGREGATE_OPERATIONS.includes(universalSettings.aggregateOperation)
  ) {
    return invalidRollup({
      message: 'A rollup field needs settings with a supported operation',
      userFriendlyMessage: msg`A rollup needs a relation and a calculation`,
    });
  }

  if (flatEntityToValidate.isUnique === true) {
    return invalidRollup({
      message: 'A rollup field cannot be unique',
      userFriendlyMessage: msg`A rollup cannot be unique`,
    });
  }

  const findFlatFieldMetadata = (universalIdentifier: string | null) =>
    isDefined(universalIdentifier)
      ? (findFlatEntityByUniversalIdentifier({
          universalIdentifier,
          flatEntityMaps: flatFieldMetadataMaps,
        }) ??
        findFlatEntityByUniversalIdentifier({
          universalIdentifier,
          flatEntityMaps: remainingFlatEntityMapsToValidate,
        }))
      : undefined;

  const relationFlatFieldMetadata = findFlatFieldMetadata(
    universalSettings.relationFieldMetadataUniversalIdentifier,
  );
  const childObjectMetadataUniversalIdentifier =
    relationFlatFieldMetadata?.relationTargetObjectMetadataUniversalIdentifier;

  if (
    !isDefined(relationFlatFieldMetadata) ||
    !isDefined(childObjectMetadataUniversalIdentifier) ||
    relationFlatFieldMetadata.objectMetadataUniversalIdentifier !==
      flatEntityToValidate.objectMetadataUniversalIdentifier ||
    !isRelationUniversalFlatFieldMetadataOfType({
      flatFieldMetadata: relationFlatFieldMetadata,
      relationType: RelationType.ONE_TO_MANY,
    })
  ) {
    return invalidRollup({
      message:
        'A rollup must go through a one-to-many relation field of its own object',
      userFriendlyMessage: msg`A rollup must use a relation of this object that lists several records`,
    });
  }

  const aggregatedFlatFieldMetadata = findFlatFieldMetadata(
    universalSettings.aggregatedFieldMetadataUniversalIdentifier,
  );

  if (
    universalSettings.aggregateOperation !== AggregateOperations.COUNT &&
    aggregatedFlatFieldMetadata?.objectMetadataUniversalIdentifier !==
      childObjectMetadataUniversalIdentifier
  ) {
    return invalidRollup({
      message:
        'The field a rollup calculates on must belong to the related object',
      userFriendlyMessage: msg`Pick a field of the related records to calculate on`,
    });
  }

  const otherRollupFlatFieldMetadatas = Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(
      (flatFieldMetadata) =>
        flatFieldMetadata.universalIdentifier !==
        flatEntityToValidate.universalIdentifier,
    )
    .filter((flatFieldMetadata) =>
      isFlatFieldMetadataOfType(flatFieldMetadata, FieldMetadataType.ROLLUP),
    );

  if (
    !isDefined(update) &&
    otherRollupFlatFieldMetadatas.filter(
      ({ objectMetadataUniversalIdentifier }) =>
        objectMetadataUniversalIdentifier ===
        flatEntityToValidate.objectMetadataUniversalIdentifier,
    ).length >= ROLLUP_MAX_FIELDS_PER_OBJECT
  ) {
    return invalidRollup({
      message: `An object cannot have more than ${ROLLUP_MAX_FIELDS_PER_OBJECT} rollup fields`,
      userFriendlyMessage: msg`This object has reached its maximum number of rollups`,
    });
  }

  const dependentUniversalIdentifiers = new Set([
    flatEntityToValidate.universalIdentifier,
    ...findRollupFlatFieldMetadatasDependingOnFields({
      fieldMetadataUniversalIdentifiers: [
        flatEntityToValidate.universalIdentifier,
      ],
      rollupFlatFieldMetadatas: otherRollupFlatFieldMetadatas,
    }).map(({ universalIdentifier }) => universalIdentifier),
  ]);

  if (
    getUniversalRollupSettingsFieldMetadataUniversalIdentifiers(
      universalSettings,
    ).some((universalIdentifier) =>
      dependentUniversalIdentifiers.has(universalIdentifier),
    )
  ) {
    return invalidRollup({
      message: 'A rollup cannot depend on itself, directly or through rollups',
      userFriendlyMessage: msg`A rollup cannot be calculated from itself`,
    });
  }

  const resultType = computeRollupResultType({
    aggregateOperation: universalSettings.aggregateOperation,
    aggregatedFieldValueType: isDefined(aggregatedFlatFieldMetadata)
      ? getFieldMetadataValueType({
          type: aggregatedFlatFieldMetadata.type,
          settings: aggregatedFlatFieldMetadata.universalSettings,
        })
      : null,
  });

  if (!isDefined(resultType)) {
    return invalidRollup({
      message: `A rollup cannot compute ${universalSettings.aggregateOperation} on this field`,
      userFriendlyMessage: msg`This calculation is not available for this field`,
    });
  }

  const existingFlatFieldMetadata = isDefined(update)
    ? findFlatFieldMetadata(flatEntityToValidate.universalIdentifier)
    : undefined;
  const existingResultType =
    isDefined(existingFlatFieldMetadata) &&
    isFlatFieldMetadataOfType(
      existingFlatFieldMetadata,
      FieldMetadataType.ROLLUP,
    )
      ? existingFlatFieldMetadata.universalSettings.resultType
      : resultType;

  if (
    resultType !== universalSettings.resultType ||
    resultType !== existingResultType
  ) {
    return invalidRollup({
      message: `The rollup result type must be ${resultType}, got ${universalSettings.resultType}`,
      userFriendlyMessage: msg`This change would turn the rollup into another type of field. Create a new rollup instead.`,
    });
  }

  if (
    isDefined(universalSettings.decimals) &&
    (!Number.isInteger(universalSettings.decimals) ||
      universalSettings.decimals < 0 ||
      universalSettings.decimals > ROLLUP_MAX_DECIMALS)
  ) {
    return invalidRollup({
      message: `Rollup decimals must be an integer between 0 and ${ROLLUP_MAX_DECIMALS}`,
      userFriendlyMessage: msg`The number of decimals is out of range`,
    });
  }

  return validateRollupFlatFieldMetadataFilters({
    universalSettings,
    childObjectMetadataUniversalIdentifier,
    flatFieldMetadataMaps,
  });
};

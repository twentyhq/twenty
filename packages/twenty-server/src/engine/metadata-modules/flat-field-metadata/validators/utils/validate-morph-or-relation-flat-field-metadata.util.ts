import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadataTypeValidationArgs } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-type-validator.type';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { validateJunctionTargetSettings } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-junction-target-settings.util';
import { validateMorphOrRelationFlatFieldJoinColumName } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-morph-or-relation-flat-field-join-column-name.util';
import { validateMorphOrRelationFlatFieldOnDelete } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-morph-or-relation-flat-field-on-delete.util';
import { type UniversalFlatEntityUpdate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-update.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

type ValidateMorphOrRelationFlatFieldMetadataUpdatesArgs = Omit<
  FlatFieldMetadataTypeValidationArgs<MorphOrRelationFieldMetadataType>,
  'updates'
> & {
  update: UniversalFlatEntityUpdate<'fieldMetadata'>;
};

export const validateMorphOrRelationFlatFieldMetadataUpdates = ({
  flatEntityToValidate: universalFlatFieldMetadata,
  optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
  },
  update,
  buildOptions,
}: ValidateMorphOrRelationFlatFieldMetadataUpdatesArgs): FlatFieldMetadataValidationError[] => {
  const errors: FlatFieldMetadataValidationError[] = [];

  const fromFlatFieldMetadata = findFlatEntityByUniversalIdentifier({
    universalIdentifier: universalFlatFieldMetadata.universalIdentifier,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(fromFlatFieldMetadata)) {
    return [
      {
        code: FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
        message: 'Could not found updated field metadata',
        userFriendlyMessage: msg`Could not found updated field metadata`,
      },
    ];
  }

  if (!isMorphOrRelationUniversalFlatFieldMetadata(fromFlatFieldMetadata)) {
    return [
      {
        code: FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
        message: 'Udpated field is not a morph relation or a relation',
        userFriendlyMessage: msg`Udpated field is not a morph relation or a relation`,
      },
    ];
  }

  const toSettings = update.universalSettings as
    | UniversalFlatFieldMetadata<MorphOrRelationFieldMetadataType>['universalSettings']
    | undefined;
  const fromSettings = fromFlatFieldMetadata.universalSettings;

  const isJoinColumnNameUpdated =
    isDefined(toSettings?.joinColumnName) &&
    isDefined(fromSettings.joinColumnName) &&
    toSettings.joinColumnName !== fromSettings.joinColumnName;

  if (isJoinColumnNameUpdated) {
    errors.push(
      ...validateMorphOrRelationFlatFieldJoinColumName({
        buildOptions,
        universalFlatFieldMetadata,
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
          flatFieldMetadataMaps,
          flatObjectMetadataMaps,
        },
      }),
    );
  }

  errors.push(
    ...validateMorphOrRelationFlatFieldOnDelete({
      universalFlatFieldMetadata,
    }),
  );

  return errors;
};

export const validateMorphOrRelationFlatFieldMetadata = ({
  flatEntityToValidate: universalFlatFieldMetadataToValidate,
  optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
  },
  update,
  remainingFlatEntityMapsToValidate,
  buildOptions,
  workspaceId,
  additionalCacheDataMaps,
}: FlatFieldMetadataTypeValidationArgs<MorphOrRelationFieldMetadataType>): FlatFieldMetadataValidationError[] => {
  const {
    relationTargetFieldMetadataUniversalIdentifier,
    relationTargetObjectMetadataUniversalIdentifier,
  } = universalFlatFieldMetadataToValidate;

  const universalIdentifiersValidation = [
    relationTargetObjectMetadataUniversalIdentifier,
    relationTargetFieldMetadataUniversalIdentifier,
  ].flatMap<FlatFieldMetadataValidationError>((universalIdentifier) =>
    isDefined(universalIdentifier)
      ? []
      : {
          code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          message: `Invalid universal identifier ${universalIdentifier}`,
          userFriendlyMessage: msg`Invalid universal identifier ${universalIdentifier}`,
          value: universalIdentifier,
        },
  );

  if (universalIdentifiersValidation.length > 0) {
    return universalIdentifiersValidation;
  }

  const errors: FlatFieldMetadataValidationError[] = [];

  const targetFlatObjectMetadata = findFlatEntityByUniversalIdentifier({
    universalIdentifier: relationTargetObjectMetadataUniversalIdentifier,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  const targetFlatFieldMetadata =
    (remainingFlatEntityMapsToValidate
      ? findFlatEntityByUniversalIdentifier({
          universalIdentifier: relationTargetFieldMetadataUniversalIdentifier,
          flatEntityMaps: remainingFlatEntityMapsToValidate,
        })
      : undefined) ??
    findFlatEntityByUniversalIdentifier({
      universalIdentifier: relationTargetFieldMetadataUniversalIdentifier,
      flatEntityMaps: flatFieldMetadataMaps,
    });

  if (!isDefined(targetFlatObjectMetadata)) {
    errors.push({
      code: FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
      message: 'Relation target object metadata not found',
      userFriendlyMessage: msg`Object targeted by the relation not found`,
    });

    return errors;
  }

  if (!isDefined(targetFlatFieldMetadata)) {
    errors.push({
      code: FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
      message: isDefined(remainingFlatEntityMapsToValidate)
        ? 'Relation field target metadata not found in both existing and about to be created field metadatas'
        : 'Relation field target metadata not found',
      userFriendlyMessage: msg`Relation field target metadata not found`,
    });
  } else {
    if (!isMorphOrRelationUniversalFlatFieldMetadata(targetFlatFieldMetadata)) {
      errors.push({
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message:
          'A relation field can only target a MORPH_RELATION or another RELATION field',
        userFriendlyMessage: msg`Invalid relation field target`,
      });
    } else {
      if (
        targetFlatFieldMetadata.objectMetadataUniversalIdentifier !==
        universalFlatFieldMetadataToValidate.relationTargetObjectMetadataUniversalIdentifier
      ) {
        errors.push({
          code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          message:
            'Target field metadata does not belong to the expected target object',
          userFriendlyMessage: msg`Target relation field does not belong to the expected object`,
        });
      }

      if (
        targetFlatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier !==
        universalFlatFieldMetadataToValidate.objectMetadataUniversalIdentifier
      ) {
        errors.push({
          code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          message:
            'Target field metadata does not point back to the source object',
          userFriendlyMessage: msg`Target relation field does not reference the source object`,
        });
      }

      if (
        targetFlatFieldMetadata.relationTargetFieldMetadataUniversalIdentifier !==
        universalFlatFieldMetadataToValidate.universalIdentifier
      ) {
        errors.push({
          code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          message:
            'Target field metadata does not point back to the source field',
          userFriendlyMessage: msg`Target relation field does not reference this field`,
        });
      }
    }
  }

  // TODO prastoin refactor FlatFieldMetadataTypeValidator to implement two code flow: create and update https://github.com/twentyhq/core-team-issues/issues/2044
  if (isDefined(update)) {
    errors.push(
      ...validateMorphOrRelationFlatFieldMetadataUpdates({
        flatEntityToValidate: universalFlatFieldMetadataToValidate,
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
          flatFieldMetadataMaps,
          flatObjectMetadataMaps,
        },
        remainingFlatEntityMapsToValidate,
        workspaceId,
        update,
        buildOptions,
        additionalCacheDataMaps,
      }),
    );
  } else {
    errors.push(
      ...validateMorphOrRelationFlatFieldJoinColumName({
        buildOptions,
        universalFlatFieldMetadata: universalFlatFieldMetadataToValidate,
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
          flatFieldMetadataMaps,
          flatObjectMetadataMaps,
        },
      }),
      ...validateMorphOrRelationFlatFieldOnDelete({
        universalFlatFieldMetadata: universalFlatFieldMetadataToValidate,
      }),
    );
  }

  errors.push(
    ...validateJunctionTargetSettings({
      universalFlatFieldMetadata: universalFlatFieldMetadataToValidate,
      flatFieldMetadataMaps,
    }),
  );

  return errors;
};

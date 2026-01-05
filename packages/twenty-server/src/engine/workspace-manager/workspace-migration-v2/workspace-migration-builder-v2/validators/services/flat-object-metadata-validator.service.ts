import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { validateFlatObjectMetadataIdentifiers } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-identifiers.util';
import { validateFlatObjectMetadataNameAndLabels } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-name-and-labels.util';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { isStandardMetadata } from 'src/engine/metadata-modules/utils/is-standard-metadata.util';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/utils/get-flat-entity-validation-error.util';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class FlatObjectMetadataValidatorService {
  public validateFlatObjectMetadataUpdate({
    flatEntityId,
    flatEntityUpdates,
    buildOptions,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
      flatFieldMetadataMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.objectMetadata
  >): FailedFlatEntityValidation<'objectMetadata', 'update'> {
    const existingFlatObjectMetadata =
      optimisticFlatObjectMetadataMaps.byId[flatEntityId];

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityId,
        universalIdentifier: existingFlatObjectMetadata?.universalIdentifier,
      },
      metadataName: 'objectMetadata',
      type: 'update',
    });

    if (!isDefined(existingFlatObjectMetadata)) {
      validationResult.errors.push({
        code: ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        message: t`Object to update not found`,
        userFriendlyMessage: msg`Object to update not found`,
      });

      return validationResult;
    }

    const updatedFlatObjectMetadata = {
      ...existingFlatObjectMetadata,
      ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
        updates: flatEntityUpdates,
      }),
    };

    validationResult.flatEntityMinimalInformation = {
      ...validationResult.flatEntityMinimalInformation,
      id: existingFlatObjectMetadata.id,
      namePlural: existingFlatObjectMetadata.namePlural,
      nameSingular: existingFlatObjectMetadata.nameSingular,
    };

    validationResult.errors.push(
      ...validateFlatObjectMetadataNameAndLabels({
        optimisticFlatObjectMetadataMaps,
        flatObjectMetadataToValidate: updatedFlatObjectMetadata,
        buildOptions,
      }),
    );

    const labelIdentifierFieldMetadataIdUpdate = flatEntityUpdates.find(
      (update) => update.property === 'labelIdentifierFieldMetadataId',
    );

    // TODO remove this once we migrated labelIdentifierFieldMetadataId as non nullable
    if (isDefined(labelIdentifierFieldMetadataIdUpdate)) {
      if (!isDefined(labelIdentifierFieldMetadataIdUpdate.to)) {
        validationResult.errors.push({
          code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
          message: 'labelIdentifierFieldMetadataId cannot be null',
          userFriendlyMessage: msg`Field label identifier is required`,
        });
      }

      validationResult.errors.push(
        ...validateFlatObjectMetadataIdentifiers({
          flatObjectMetadata: updatedFlatObjectMetadata,
          flatFieldMetadataMaps,
          buildOptions,
        }),
      );
    }

    return validationResult;
  }

  public validateFlatObjectMetadataDeletion({
    flatEntityToValidate: { id: objectMetadataToDeleteId, universalIdentifier },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
    },
    buildOptions,
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.objectMetadata
  >): FailedFlatEntityValidation<'objectMetadata', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: objectMetadataToDeleteId,
        universalIdentifier,
      },
      metadataName: 'objectMetadata',
      type: 'delete',
    });

    const flatObjectMetadataToDelete =
      optimisticFlatObjectMetadataMaps.byId[objectMetadataToDeleteId];

    if (!isDefined(flatObjectMetadataToDelete)) {
      validationResult.errors.push({
        code: ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        message: t`Object to delete not found`,
        userFriendlyMessage: msg`Object to delete not found`,
      });
    } else {
      validationResult.flatEntityMinimalInformation = {
        ...validationResult.flatEntityMinimalInformation,
        namePlural: flatObjectMetadataToDelete.namePlural,
        nameSingular: flatObjectMetadataToDelete.nameSingular,
      };

      if (flatObjectMetadataToDelete.isRemote) {
        validationResult.errors.push({
          code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
          message: t`Remote objects are not supported yet`,
          userFriendlyMessage: msg`Remote objects are not supported yet`,
        });
      }

      if (
        !buildOptions.isSystemBuild &&
        isStandardMetadata(flatObjectMetadataToDelete)
      ) {
        validationResult.errors.push({
          code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
          message: t`Standard objects cannot be deleted`,
          userFriendlyMessage: msg`Standard objects cannot be deleted`,
        });
      }
    }

    return validationResult;
  }

  public validateFlatObjectMetadataCreation({
    flatEntityToValidate: flatObjectMetadataToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
      flatFieldMetadataMaps,
    },
    buildOptions,
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.objectMetadata
  >): FailedFlatEntityValidation<'objectMetadata', 'create'> {
    const objectValidationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatObjectMetadataToValidate.id,
        universalIdentifier: flatObjectMetadataToValidate.universalIdentifier,
        namePlural: flatObjectMetadataToValidate.namePlural,
        nameSingular: flatObjectMetadataToValidate.nameSingular,
      },
      metadataName: 'objectMetadata',
      type: 'create',
    });

    if (
      isDefined(
        optimisticFlatObjectMetadataMaps.byId[flatObjectMetadataToValidate.id],
      )
    ) {
      objectValidationResult.errors.push({
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message: t`Object with same id already exists`,
        userFriendlyMessage: msg`Object with same id already exists`,
      });
    }

    if (flatObjectMetadataToValidate.isRemote) {
      objectValidationResult.errors.push({
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message: t`Remote objects are not supported yet`,
        userFriendlyMessage: msg`Remote objects are not supported yet`,
      });
    }

    objectValidationResult.errors.push(
      ...validateFlatObjectMetadataIdentifiers({
        flatObjectMetadata: flatObjectMetadataToValidate,
        flatFieldMetadataMaps,
        buildOptions,
      }),
    );
    objectValidationResult.errors.push(
      ...validateFlatObjectMetadataNameAndLabels({
        optimisticFlatObjectMetadataMaps,
        flatObjectMetadataToValidate,
        buildOptions,
      }),
    );

    return objectValidationResult;
  }
}

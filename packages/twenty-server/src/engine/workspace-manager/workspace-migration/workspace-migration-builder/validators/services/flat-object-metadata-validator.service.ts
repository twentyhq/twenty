import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { validateFlatObjectMetadataIdentifiers } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-identifiers.util';
import { validateFlatObjectMetadataNameAndLabels } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-name-and-labels.util';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

@Injectable()
export class FlatObjectMetadataValidatorService {
  public validateFlatObjectMetadataUpdate({
    universalIdentifier,
    flatEntityUpdate,
    buildOptions,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
      flatFieldMetadataMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.objectMetadata
  >): FailedFlatEntityValidation<'objectMetadata', 'update'> {
    const existingFlatObjectMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatObjectMetadataMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
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
      ...flatEntityUpdate,
    };

    validationResult.flatEntityMinimalInformation = {
      ...validationResult.flatEntityMinimalInformation,
      namePlural: existingFlatObjectMetadata.namePlural,
      nameSingular: existingFlatObjectMetadata.nameSingular,
    };

    validationResult.errors.push(
      ...validateFlatObjectMetadataNameAndLabels({
        optimisticUniversalFlatObjectMetadataMaps:
          optimisticFlatObjectMetadataMaps,
        universalFlatObjectMetadataToValidate: updatedFlatObjectMetadata,
        buildOptions,
      }),
    );
    // TODO remove this once we migrated labelIdentifierFieldMetadataId as non nullable
    if (
      flatEntityUpdate.labelIdentifierFieldMetadataUniversalIdentifier !==
      undefined
    ) {
      if (
        flatEntityUpdate.labelIdentifierFieldMetadataUniversalIdentifier ===
        null
      ) {
        validationResult.errors.push({
          code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
          message: 'labelIdentifierFieldMetadataId cannot be null',
          userFriendlyMessage: msg`Field label identifier is required`,
        });
      }

      validationResult.errors.push(
        ...validateFlatObjectMetadataIdentifiers({
          universalFlatObjectMetadata: updatedFlatObjectMetadata,
          universalFlatFieldMetadataMaps: flatFieldMetadataMaps,
        }),
      );
    }

    return validationResult;
  }

  public validateFlatObjectMetadataDeletion({
    flatEntityToValidate: { universalIdentifier },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
    },
    buildOptions,
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.objectMetadata
  >): FailedFlatEntityValidation<'objectMetadata', 'delete'> {
    const flatObjectMetadataToDelete = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatObjectMetadataMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'objectMetadata',
      type: 'delete',
    });

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
        belongsToTwentyStandardApp(flatObjectMetadataToDelete)
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
      flatObjectMetadataMaps: optimisticUniversalFlatObjectMetadataMaps,
      flatFieldMetadataMaps,
    },
    buildOptions,
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.objectMetadata
  >): FailedFlatEntityValidation<'objectMetadata', 'create'> {
    const objectValidationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatObjectMetadataToValidate.universalIdentifier,
        namePlural: flatObjectMetadataToValidate.namePlural,
        nameSingular: flatObjectMetadataToValidate.nameSingular,
      },
      metadataName: 'objectMetadata',
      type: 'create',
    });

    if (
      isDefined(
        findFlatEntityByUniversalIdentifier({
          universalIdentifier: flatObjectMetadataToValidate.universalIdentifier,
          flatEntityMaps: optimisticUniversalFlatObjectMetadataMaps,
        }),
      )
    ) {
      objectValidationResult.errors.push({
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message: t`Object with same universal identifier already exists`,
        userFriendlyMessage: msg`Object with same universal identifier already exists`,
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
        universalFlatObjectMetadata: flatObjectMetadataToValidate,
        universalFlatFieldMetadataMaps: flatFieldMetadataMaps,
      }),
    );
    objectValidationResult.errors.push(
      ...validateFlatObjectMetadataNameAndLabels({
        optimisticUniversalFlatObjectMetadataMaps,
        universalFlatObjectMetadataToValidate: flatObjectMetadataToValidate,
        buildOptions,
      }),
    );

    return objectValidationResult;
  }
}

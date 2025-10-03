import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { validateFlatObjectMetadataIdentifiers } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-identifiers.util';
import { validateFlatObjectMetadataNameAndLabels } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-name-and-labels.util';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { isStandardMetadata } from 'src/engine/metadata-modules/utils/is-standard-metadata.util';
import { ObjectMetadataRelatedFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/object/services/workspace-migration-v2-object-actions-builder.service';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-builder-options.type';

export type ValidateOneObjectMetadataArgs = {
  flatObjectMetadataToValidate: FlatObjectMetadata;
  optimisticFlatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  buildOptions: WorkspaceMigrationBuilderOptions;
  dependencyOptimisticFlatEntityMaps: ObjectMetadataRelatedFlatEntityMaps;
};

@Injectable()
export class FlatObjectMetadataValidatorService {
  public validateFlatObjectMetadataUpdate({
    optimisticFlatObjectMetadataMaps,
    flatObjectMetadataToValidate: updatedFlatObjectMetadata,
    dependencyOptimisticFlatEntityMaps: { flatFieldMetadataMaps },
  }: ValidateOneObjectMetadataArgs): FailedFlatEntityValidation<FlatObjectMetadata> {
    const validationResult: FailedFlatEntityValidation<FlatObjectMetadata> = {
      type: 'update_object',
      errors: [],
      flatEntityMinimalInformation: {
        id: updatedFlatObjectMetadata.id,
      },
    };

    const existingFlatObjectMetadata =
      optimisticFlatObjectMetadataMaps.byId[updatedFlatObjectMetadata.id];

    if (!isDefined(existingFlatObjectMetadata)) {
      validationResult.errors.push({
        code: ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        message: t`Object to update not found`,
        userFriendlyMessage: t`Object to update not found`,
      });

      return validationResult;
    }
    validationResult.flatEntityMinimalInformation = {
      id: existingFlatObjectMetadata.id,
      namePlural: existingFlatObjectMetadata.namePlural,
      nameSingular: existingFlatObjectMetadata.nameSingular,
    };

    validationResult.errors.push(
      ...validateFlatObjectMetadataNameAndLabels({
        optimisticFlatObjectMetadataMaps,
        flatObjectMetadataToValidate: updatedFlatObjectMetadata,
      }),
    );

    validationResult.errors.push(
      ...validateFlatObjectMetadataIdentifiers({
        flatObjectMetadata: existingFlatObjectMetadata,
        flatFieldMetadataMaps,
      }),
    );

    return validationResult;
  }

  public validateFlatObjectMetadataDeletion({
    flatObjectMetadataToValidate: { id: objectMetadataToDeleteId },
    optimisticFlatObjectMetadataMaps,
    buildOptions,
  }: ValidateOneObjectMetadataArgs): FailedFlatEntityValidation<FlatObjectMetadata> {
    const validationResult: FailedFlatEntityValidation<FlatObjectMetadata> = {
      type: 'delete_object',
      errors: [],
      flatEntityMinimalInformation: {
        id: objectMetadataToDeleteId,
      },
    };

    const flatObjectMetadataToDelete =
      optimisticFlatObjectMetadataMaps.byId[objectMetadataToDeleteId];

    if (!isDefined(flatObjectMetadataToDelete)) {
      validationResult.errors.push({
        code: ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        message: t`Object to delete not found`,
        userFriendlyMessage: t`Object to delete not found`,
      });
    } else {
      validationResult.flatEntityMinimalInformation = {
        id: flatObjectMetadataToDelete.id,
        namePlural: flatObjectMetadataToDelete.namePlural,
        nameSingular: flatObjectMetadataToDelete.nameSingular,
      };

      if (flatObjectMetadataToDelete.isRemote) {
        validationResult.errors.push({
          code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
          message: t`Remote objects are not supported yet`,
          userFriendlyMessage: t`Remote objects are not supported yet`,
        });
      }

      if (
        !buildOptions.isSystemBuild &&
        isStandardMetadata(flatObjectMetadataToDelete)
      ) {
        validationResult.errors.push({
          code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
          message: t`Standard objects cannot be deleted`,
          userFriendlyMessage: t`Standard objects cannot be deleted`,
        });
      }

      if (!buildOptions.isSystemBuild && flatObjectMetadataToDelete.isActive) {
        validationResult.errors.push({
          code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
          message: t`Active objects cannot be deleted`,
          userFriendlyMessage: t`Active objects cannot be deleted`,
        });
      }
    }

    return validationResult;
  }

  public async validateFlatObjectMetadataCreation({
    optimisticFlatObjectMetadataMaps,
    flatObjectMetadataToValidate,
    dependencyOptimisticFlatEntityMaps: { flatFieldMetadataMaps },
  }: ValidateOneObjectMetadataArgs): Promise<
    FailedFlatEntityValidation<FlatObjectMetadata>
  > {
    const objectValidationResult: FailedFlatEntityValidation<FlatObjectMetadata> =
      {
        type: 'create_object',
        errors: [],
        flatEntityMinimalInformation: {
          id: flatObjectMetadataToValidate.id,
          namePlural: flatObjectMetadataToValidate.namePlural,
          nameSingular: flatObjectMetadataToValidate.nameSingular,
        },
      };

    if (
      isDefined(
        optimisticFlatObjectMetadataMaps.byId[flatObjectMetadataToValidate.id],
      )
    ) {
      objectValidationResult.errors.push({
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message: t`Object with same id already exists`,
        userFriendlyMessage: t`Object with same id already exists`,
      });
    }

    if (flatObjectMetadataToValidate.isRemote) {
      objectValidationResult.errors.push({
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message: t`Remote objects are not supported yet`,
        userFriendlyMessage: t`Remote objects are not supported yet`,
      });
    }

    objectValidationResult.errors.push(
      ...validateFlatObjectMetadataIdentifiers({
        flatObjectMetadata: flatObjectMetadataToValidate,
        flatFieldMetadataMaps,
      }),
    );
    objectValidationResult.errors.push(
      ...validateFlatObjectMetadataNameAndLabels({
        optimisticFlatObjectMetadataMaps,
        flatObjectMetadataToValidate,
      }),
    );

    return objectValidationResult;
  }
}

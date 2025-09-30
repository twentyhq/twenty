import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatObjectMetadataValidationError } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-validation-error.type';
import {
  FlatObjectMetadata,
  FlatObjectMetadataSecond,
} from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { areFlatObjectMetadataNamesSyncedWithLabels } from 'src/engine/metadata-modules/flat-object-metadata/utils/are-flat-object-metadata-names-synced-with-labels.util';
import { validateFlatObjectMetadataIdentifiers } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-identifiers.util';
import { validateFlatObjectMetadataLabel } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-label.util';
import { validateFlatObjectMetadataNames } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-name.util';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { isStandardMetadata } from 'src/engine/metadata-modules/utils/is-standard-metadata.util';
import { doesOtherObjectWithSameNameExists } from 'src/engine/metadata-modules/utils/validate-no-other-object-with-same-name-exists-or-throw.util';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-builder-options.type';

export type ValidateOneObjectMetadataArgs = {
  flatObjectMetadataToValidate: FlatObjectMetadataSecond;
  optimisticFlatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadataSecond>;
  buildOptions: WorkspaceMigrationBuilderOptions;
};

@Injectable()
export class FlatObjectMetadataValidatorService {
  constructor() {}

  public validateFlatObjectMetadataUpdate({
    optimisticFlatObjectMetadataMaps,
    flatObjectMetadataToValidate: updatedFlatObjectMetadata,
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
      ...this.validateFlatObjectMetadataNameAndLabels({
        optimisticFlatObjectMetadataMaps,
        flatObjectMetadataToValidate: updatedFlatObjectMetadata,
      }),
    );

    // Issue here TODO
    validationResult.errors.push(
      ...validateFlatObjectMetadataIdentifiers(existingFlatObjectMetadata),
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
        value: objectMetadataToDeleteId,
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
  }: ValidateOneObjectMetadataArgs): Promise<
    FailedFlatEntityValidation<FlatObjectMetadata>
  > {
    const objectValidationResult: FailedFlatEntityValidation<
      FlatObjectMetadata | FlatFieldMetadata
    > = {
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

    // Issue here TODO
    objectValidationResult.errors.push(
      ...validateFlatObjectMetadataIdentifiers(flatObjectMetadataToValidate),
    );
    objectValidationResult.errors.push(
      ...this.validateFlatObjectMetadataNameAndLabels({
        optimisticFlatObjectMetadataMaps,
        flatObjectMetadataToValidate,
      }),
    );

    return objectValidationResult;
  }

  private validateFlatObjectMetadataNameAndLabels({
    optimisticFlatObjectMetadataMaps,
    flatObjectMetadataToValidate,
  }: {
    flatObjectMetadataToValidate: FlatObjectMetadataSecond;
    optimisticFlatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadataSecond>;
  }): FlatObjectMetadataValidationError[] {
    const errors: FlatObjectMetadataValidationError[] = [];

    errors.push(
      ...validateFlatObjectMetadataNames({
        namePlural: flatObjectMetadataToValidate.namePlural,
        nameSingular: flatObjectMetadataToValidate.nameSingular,
      }),
    );

    errors.push(
      ...validateFlatObjectMetadataLabel({
        labelPlural: flatObjectMetadataToValidate.labelPlural,
        labelSingular: flatObjectMetadataToValidate.labelSingular,
      }),
    );

    if (
      flatObjectMetadataToValidate.isLabelSyncedWithName &&
      !areFlatObjectMetadataNamesSyncedWithLabels(flatObjectMetadataToValidate)
    ) {
      errors.push({
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message: t`Names are not synced with labels`,
        userFriendlyMessage: t`Names are not synced with labels`,
      });
    }

    if (
      doesOtherObjectWithSameNameExists({
        objectMetadataNamePlural: flatObjectMetadataToValidate.namePlural,
        objectMetadataNameSingular: flatObjectMetadataToValidate.nameSingular,
        objectMetadataMaps: optimisticFlatObjectMetadataMaps,
        existingObjectMetadataId: flatObjectMetadataToValidate.id,
      })
    ) {
      errors.push({
        code: ObjectMetadataExceptionCode.OBJECT_ALREADY_EXISTS,
        message: 'Object already exists',
        userFriendlyMessage: t`Object already exists`,
      });
    }

    return errors;
  }
}

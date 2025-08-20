import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { FlatFieldMetadataValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-validator.service';
import { FailedFlatFieldMetadataValidation } from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { isRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-relation-flat-field-metadata.util';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-field-metadata-in-flat-object-metadata-maps-or-throw.util';
import { addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-object-metadata-to-flat-object-metadata-maps-or-throw.util';
import { findFlatObjectMetadataInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-in-flat-object-metadata-maps.util';
import { FailedFlatObjectMetadataValidation } from 'src/engine/metadata-modules/flat-object-metadata/types/failed-flat-object-metadata-validation.type';
import { FlatObjectMetadataValidationError } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-validation-error.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { areFlatObjectMetadataNamesSyncedWithLabels } from 'src/engine/metadata-modules/flat-object-metadata/utils/are-flat-object-metadata-names-synced-with-labels.util';
import { computeRelationTargetFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/compute-relation-target-flat-object-metadata-maps.util';
import { getDefaultFailedFlatObjectMetadataValidation } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-default-failed-flat-object-metadata-validation.type';
import { validateFlatObjectMetadataIdentifiers } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-identifiers.util';
import { validateFlatObjectMetadataLabel } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-label.util';
import { validateFlatObjectMetadataNames } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-name.util';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { isStandardMetadata } from 'src/engine/metadata-modules/utils/is-standard-metadata.util';
import { doesOtherObjectWithSameNameExists } from 'src/engine/metadata-modules/utils/validate-no-other-object-with-same-name-exists-or-throw.util';
import { WorkspaceMigrationV2BuilderOptions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-migration-builder-v2.service';

@Injectable()
export class FlatObjectMetadataValidatorService {
  constructor(
    private readonly flatFieldMetadataValidatorService: FlatFieldMetadataValidatorService,
  ) {}

  public validateFlatObjectMetadataUpdate({
    existingFlatObjectMetadataMaps,
    updatedFlatObjectMetadata,
  }: {
    existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
    updatedFlatObjectMetadata: FlatObjectMetadata;
  }): FailedFlatObjectMetadataValidation {
    const validationResult = getDefaultFailedFlatObjectMetadataValidation({
      type: 'update_object',
      objectMinimalInformation: {
        id: updatedFlatObjectMetadata.id,
      },
    });

    const existingFlatObjectMetadata =
      existingFlatObjectMetadataMaps.byId[updatedFlatObjectMetadata.id];

    if (!isDefined(existingFlatObjectMetadata)) {
      validationResult.objectLevelErrors.push({
        code: ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        message: t`Object to update not found`,
        userFriendlyMessage: t`Object to update not found`,
      });

      return validationResult;
    }
    validationResult.objectMinimalInformation = {
      id: existingFlatObjectMetadata.id,
      namePlural: existingFlatObjectMetadata.namePlural,
      nameSingular: existingFlatObjectMetadata.nameSingular,
    };

    validationResult.objectLevelErrors.push(
      ...this.validateFlatObjectMetadataNameAndLabels({
        existingFlatObjectMetadataMaps,
        flatObjectMetadataToValidate: updatedFlatObjectMetadata,
      }),
    );

    validationResult.objectLevelErrors.push(
      ...validateFlatObjectMetadataIdentifiers(existingFlatObjectMetadata),
    );

    return validationResult;
  }

  public validateFlatObjectMetadataDeletion({
    existingFlatObjectMetadataMaps,
    objectMetadataToDeleteId,
    buildOptions,
  }: {
    existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
    objectMetadataToDeleteId: string;
    buildOptions: WorkspaceMigrationV2BuilderOptions;
  }): FailedFlatObjectMetadataValidation {
    const validationResult = getDefaultFailedFlatObjectMetadataValidation({
      type: 'delete_object',
      objectMinimalInformation: {
        id: objectMetadataToDeleteId,
      },
    });

    const flatObjectMetadataToDelete =
      existingFlatObjectMetadataMaps.byId[objectMetadataToDeleteId];

    if (!isDefined(flatObjectMetadataToDelete)) {
      validationResult.objectLevelErrors.push({
        code: ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        message: t`Object to delete not found`,
        userFriendlyMessage: t`Object to delete not found`,
        value: objectMetadataToDeleteId,
      });
    } else {
      validationResult.objectMinimalInformation = {
        id: flatObjectMetadataToDelete.id,
        namePlural: flatObjectMetadataToDelete.namePlural,
        nameSingular: flatObjectMetadataToDelete.nameSingular,
      };

      if (flatObjectMetadataToDelete.isRemote) {
        validationResult.objectLevelErrors.push({
          code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
          message: t`Remote objects are not supported yet`,
          userFriendlyMessage: t`Remote objects are not supported yet`,
        });
      }

      if (
        !buildOptions.isSystemBuild &&
        isStandardMetadata(flatObjectMetadataToDelete)
      ) {
        validationResult.objectLevelErrors.push({
          code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
          message: t`Standard objects cannot be deleted`,
          userFriendlyMessage: t`Standard objects cannot be deleted`,
        });
      }

      if (!buildOptions.isSystemBuild && flatObjectMetadataToDelete.isActive) {
        validationResult.objectLevelErrors.push({
          code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
          message: t`Active objects cannot be deleted`,
          userFriendlyMessage: t`Active objects cannot be deleted`,
        });
      }
    }

    return validationResult;
  }

  public async validateFlatObjectMetadataCreation({
    existingFlatObjectMetadataMaps,
    flatObjectMetadataToValidate,
    otherFlatObjectMetadataMapsToValidate,
  }: {
    existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
    flatObjectMetadataToValidate: FlatObjectMetadata;
    otherFlatObjectMetadataMapsToValidate?: FlatObjectMetadataMaps;
  }): Promise<FailedFlatObjectMetadataValidation> {
    const validationResult = getDefaultFailedFlatObjectMetadataValidation({
      type: 'create_object',
      objectMinimalInformation: {
        id: flatObjectMetadataToValidate.id,
        namePlural: flatObjectMetadataToValidate.namePlural,
        nameSingular: flatObjectMetadataToValidate.nameSingular,
      },
    });

    if (
      isDefined(
        findFlatObjectMetadataInFlatObjectMetadataMaps({
          flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
          objectMetadataId: flatObjectMetadataToValidate.id,
        }),
      )
    ) {
      validationResult.objectLevelErrors.push({
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message: t`Object with same id already exists`,
        userFriendlyMessage: t`Object with same id already exists`,
      });
    }

    if (flatObjectMetadataToValidate.isRemote) {
      validationResult.objectLevelErrors.push({
        code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        message: t`Remote objects are not supported yet`,
        userFriendlyMessage: t`Remote objects are not supported yet`,
      });
    }

    validationResult.objectLevelErrors.push(
      ...this.validateFlatObjectMetadataNameAndLabels({
        existingFlatObjectMetadataMaps,
        flatObjectMetadataToValidate,
      }),
    );

    const allFlatFieldMetadatasValidationErrors: FailedFlatFieldMetadataValidation[] =
      [];
    let optimisticFlatObjectMetadataMaps =
      addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow({
        flatObjectMetadata: {
          ...flatObjectMetadataToValidate,
          flatFieldMetadatas: [],
        },
        flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      });

    for (const flatFieldMetadataToValidate of flatObjectMetadataToValidate.flatFieldMetadatas) {
      const relationTargetFlatObjectMetadataMaps =
        isRelationFlatFieldMetadata(flatFieldMetadataToValidate) &&
        isDefined(otherFlatObjectMetadataMapsToValidate)
          ? computeRelationTargetFlatObjectMetadataMaps({
              flatFieldMetadata: flatFieldMetadataToValidate,
              flatObjectMetadataMaps: otherFlatObjectMetadataMapsToValidate,
            })
          : undefined;
      const flatFieldValidatorErrors =
        await this.flatFieldMetadataValidatorService.validateFlatFieldMetadataCreation(
          {
            existingFlatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
            flatFieldMetadataToValidate,
            workspaceId: flatObjectMetadataToValidate.workspaceId,
            otherFlatObjectMetadataMapsToValidate:
              relationTargetFlatObjectMetadataMaps,
          },
        );

      if (flatFieldValidatorErrors.errors.length > 0) {
        allFlatFieldMetadatasValidationErrors.push(flatFieldValidatorErrors);
        continue;
      }

      optimisticFlatObjectMetadataMaps =
        addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
          flatFieldMetadata: flatFieldMetadataToValidate,
          flatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
        });
    }

    if (allFlatFieldMetadatasValidationErrors.length > 0) {
      validationResult.fieldLevelErrors.push(
        ...allFlatFieldMetadatasValidationErrors,
      );
    }

    return validationResult;
  }

  private validateFlatObjectMetadataNameAndLabels({
    existingFlatObjectMetadataMaps,
    flatObjectMetadataToValidate,
  }: {
    flatObjectMetadataToValidate: FlatObjectMetadata;
    existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
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
        objectMetadataMaps: existingFlatObjectMetadataMaps,
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

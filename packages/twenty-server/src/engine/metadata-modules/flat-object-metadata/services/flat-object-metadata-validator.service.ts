import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import {
  isDefined,
  isLabelIdentifierFieldMetadataTypes,
} from 'twenty-shared/utils';

import { FlatFieldMetadataValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-validator.service';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-field-metadata-in-flat-object-metadata-maps-or-throw.util';
import { addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-object-metadata-to-flat-object-metadata-maps-or-throw.util';
import { findFlatObjectMetadataInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-in-flat-object-metadata-maps.util';
import { FlatObjectMetadataValidationError } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-validation-error.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { areFlatObjectMetadataNamesSyncedWithLabels } from 'src/engine/metadata-modules/flat-object-metadata/utils/are-flat-object-metadata-names-synced-with-labels.util';
import { computeMorphOrRelationTargetFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/compute-morph-or-relation-target-flat-object-metadata-maps.util';
import { validateFlatObjectMetadataIdentifiers } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-identifiers.util';
import { validateFlatObjectMetadataLabel } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-label.util';
import { validateFlatObjectMetadataNames } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-name.util';
import { ObjectMetadataExceptionCode } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { isStandardMetadata } from 'src/engine/metadata-modules/utils/is-standard-metadata.util';
import { doesOtherObjectWithSameNameExists } from 'src/engine/metadata-modules/utils/validate-no-other-object-with-same-name-exists-or-throw.util';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
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
  }): FailedFlatEntityValidation<FlatObjectMetadata> {
    const validationResult: FailedFlatEntityValidation<FlatObjectMetadata> = {
      type: 'update_object',
      errors: [],
      flatEntityMinimalInformation: {
        id: updatedFlatObjectMetadata.id,
      },
    };

    const existingFlatObjectMetadata =
      existingFlatObjectMetadataMaps.byId[updatedFlatObjectMetadata.id];

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
        existingFlatObjectMetadataMaps,
        flatObjectMetadataToValidate: updatedFlatObjectMetadata,
      }),
    );

    validationResult.errors.push(
      ...validateFlatObjectMetadataIdentifiers(existingFlatObjectMetadata),
    );

    validationResult.errors.push(
      ...this.validateFlatObjectMetadataLabelIdentifierFieldMetadataId({
        flatObjectMetadata: updatedFlatObjectMetadata,
      }),
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
  }): FailedFlatEntityValidation<FlatObjectMetadata> {
    const validationResult: FailedFlatEntityValidation<FlatObjectMetadata> = {
      type: 'delete_object',
      errors: [],
      flatEntityMinimalInformation: {
        id: objectMetadataToDeleteId,
      },
    };

    const flatObjectMetadataToDelete =
      existingFlatObjectMetadataMaps.byId[objectMetadataToDeleteId];

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
    existingFlatObjectMetadataMaps,
    flatObjectMetadataToValidate,
    otherFlatObjectMetadataMapsToValidate,
  }: {
    existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
    flatObjectMetadataToValidate: FlatObjectMetadata;
    otherFlatObjectMetadataMapsToValidate?: FlatObjectMetadataMaps;
  }): Promise<{
    objectValidationResult: FailedFlatEntityValidation<FlatObjectMetadata>;
    fieldValidationResults: FailedFlatEntityValidation<FlatFieldMetadata>[];
  }> {
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
        findFlatObjectMetadataInFlatObjectMetadataMaps({
          flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
          objectMetadataId: flatObjectMetadataToValidate.id,
        }),
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
      ...this.validateFlatObjectMetadataLabelIdentifierFieldMetadataId({
        flatObjectMetadata: flatObjectMetadataToValidate,
      }),
    );

    objectValidationResult.errors.push(
      ...this.validateFlatObjectMetadataNameAndLabels({
        existingFlatObjectMetadataMaps,
        flatObjectMetadataToValidate,
      }),
    );

    const fieldValidationResults: FailedFlatEntityValidation<FlatFieldMetadata>[] =
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
        isMorphOrRelationFlatFieldMetadata(flatFieldMetadataToValidate) &&
        isDefined(otherFlatObjectMetadataMapsToValidate)
          ? computeMorphOrRelationTargetFlatObjectMetadataMaps({
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
        fieldValidationResults.push(flatFieldValidatorErrors);
        continue;
      }

      optimisticFlatObjectMetadataMaps =
        addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
          flatFieldMetadata: flatFieldMetadataToValidate,
          flatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
        });
    }

    return {
      fieldValidationResults,
      objectValidationResult,
    };
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

  private validateFlatObjectMetadataLabelIdentifierFieldMetadataId({
    flatObjectMetadata,
  }: {
    flatObjectMetadata: FlatObjectMetadata;
  }) {
    const errors: FlatObjectMetadataValidationError[] = [];

    if (!isDefined(flatObjectMetadata.labelIdentifierFieldMetadataId)) {
      errors.push({
        code: ObjectMetadataExceptionCode.MISSING_CUSTOM_OBJECT_DEFAULT_LABEL_IDENTIFIER_FIELD,
        message: t`Label identifier field metadata is required`,
        userFriendlyMessage: t`Label identifier field metadata is required`,
      });
    } else {
      const relatedFlatFieldMetadata =
        flatObjectMetadata.flatFieldMetadatas.find(
          (flatFieldMetadata) =>
            flatFieldMetadata.id ===
            flatObjectMetadata.labelIdentifierFieldMetadataId,
        );

      if (!relatedFlatFieldMetadata) {
        errors.push({
          code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
          message: t`Label identifier field metadata not found in field metadata list`,
          userFriendlyMessage: t`Label identifier field metadata not found in field metadata list`,
          value: flatObjectMetadata.labelIdentifierFieldMetadataId,
        });
      } else {
        if (
          !isLabelIdentifierFieldMetadataTypes(relatedFlatFieldMetadata.type)
        ) {
          errors.push({
            code: ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
            message: t`Label identifier field metadata must be a TEXT or FULL_NAME field type`,
            userFriendlyMessage: t`Label identifier field metadata must be a TEXT or FULL_NAME field type`,
            value: relatedFlatFieldMetadata.type,
          });
        }
      }
    }

    return errors;
  }
}

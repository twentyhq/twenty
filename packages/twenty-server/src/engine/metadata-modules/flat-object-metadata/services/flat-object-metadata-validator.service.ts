import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { FlatFieldMetadataValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-validator.service';
import { FailedFlatFieldMetadataValidationExceptions } from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { isRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-relation-flat-field-metadata.util';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-field-metadata-in-flat-object-metadata-maps-or-throw.util';
import { addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-object-metadata-to-flat-object-metadata-maps-or-throw.util';
import { findFlatObjectMetadataInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-in-flat-object-metadata-maps.util';
import { FailedFlatObjectMetadataValidationExceptions } from 'src/engine/metadata-modules/flat-object-metadata/types/failed-flat-object-metadata-validation.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { areFlatObjectMetadataNamesSyncedWithLabels } from 'src/engine/metadata-modules/flat-object-metadata/utils/are-flat-object-metadata-names-synced-with-labels.util';
import { computeRelationTargetFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/compute-relation-target-flat-object-metadata-maps.util';
import { validateFlatObjectMetadataIdentifiers } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-identifiers.util';
import { validateFlatObjectMetadataLabel } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-label.util';
import { validateFlatObjectMetadataNames } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-name.util';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
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
  }) {
    const existingFlatObjectMetadata =
      existingFlatObjectMetadataMaps.byId[updatedFlatObjectMetadata.id];

    if (!isDefined(existingFlatObjectMetadata)) {
      return [
        new ObjectMetadataException(
          t`Object to update not found`,
          ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        ),
      ];
    }
    const errors: FailedFlatObjectMetadataValidationExceptions[] = [];

    errors.push(
      ...this.validateFlatObjectMetadataNameAndLabels({
        existingFlatObjectMetadataMaps,
        flatObjectMetadataToValidate: updatedFlatObjectMetadata,
      }),
    );

    errors.push(
      ...validateFlatObjectMetadataIdentifiers(existingFlatObjectMetadata),
    );

    return errors;
  }

  public validateFlatObjectMetadataDeletion({
    existingFlatObjectMetadataMaps,
    objectMetadataToDeleteId,
    buildOptions,
  }: {
    existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
    objectMetadataToDeleteId: string;
    buildOptions: WorkspaceMigrationV2BuilderOptions;
  }) {
    const errors: FailedFlatObjectMetadataValidationExceptions[] = [];

    const flatObjectMetadataToDelete =
      existingFlatObjectMetadataMaps.byId[objectMetadataToDeleteId];

    if (!isDefined(flatObjectMetadataToDelete)) {
      errors.push(
        new ObjectMetadataException(
          t`Object to delete not found`,
          ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        ),
      );
    } else {
      if (flatObjectMetadataToDelete.isRemote) {
        errors.push(
          new ObjectMetadataException(
            t`Remote objects are not supported yet`,
            ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
          ),
        );
      }

      if (
        !buildOptions.isSystemBuild &&
        isStandardMetadata(flatObjectMetadataToDelete)
      ) {
        errors.push(
          new ObjectMetadataException(
            t`Standard objects cannot be deleted`,
            ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
          ),
        );
      }

      if (!buildOptions.isSystemBuild && flatObjectMetadataToDelete.isActive) {
        errors.push(
          new ObjectMetadataException(
            t`Active objects cannot be deleted`,
            ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
          ),
        );
      }
    }

    return errors;
  }

  public async validateFlatObjectMetadataCreation({
    existingFlatObjectMetadataMaps,
    flatObjectMetadataToValidate,
    otherFlatObjectMetadataMapsToValidate,
  }: {
    existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
    flatObjectMetadataToValidate: FlatObjectMetadata;
    otherFlatObjectMetadataMapsToValidate?: FlatObjectMetadataMaps;
  }) {
    const errors: FailedFlatObjectMetadataValidationExceptions[] = [];

    if (
      isDefined(
        findFlatObjectMetadataInFlatObjectMetadataMaps({
          flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
          objectMetadataId: flatObjectMetadataToValidate.id,
        }),
      )
    ) {
      errors.push(
        new ObjectMetadataException(
          t`Object with same id already exists`,
          ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        ),
      );
    }

    if (flatObjectMetadataToValidate.isRemote) {
      errors.push(
        new ObjectMetadataException(
          t`Remote objects are not supported yet`,
          ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        ),
      );
    }

    errors.push(
      ...this.validateFlatObjectMetadataNameAndLabels({
        existingFlatObjectMetadataMaps,
        flatObjectMetadataToValidate,
      }),
    );

    const allFlatFieldMetadatasValidationErrors: FailedFlatFieldMetadataValidationExceptions[] =
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

      if (flatFieldValidatorErrors.length > 0) {
        allFlatFieldMetadatasValidationErrors.push(...flatFieldValidatorErrors);
        continue;
      }

      optimisticFlatObjectMetadataMaps =
        addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
          flatFieldMetadata: flatFieldMetadataToValidate,
          flatObjectMetadataMaps: optimisticFlatObjectMetadataMaps,
        });
    }

    if (allFlatFieldMetadatasValidationErrors.length > 0) {
      errors.push(...allFlatFieldMetadatasValidationErrors);
    }

    return errors;
  }

  private validateFlatObjectMetadataNameAndLabels({
    existingFlatObjectMetadataMaps,
    flatObjectMetadataToValidate,
  }: {
    flatObjectMetadataToValidate: FlatObjectMetadata;
    existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
  }) {
    const errors: FailedFlatObjectMetadataValidationExceptions[] = [];

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
      errors.push(
        new ObjectMetadataException(
          t`Names are not synced with labels`,
          ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        ),
      );
    }

    if (
      doesOtherObjectWithSameNameExists({
        objectMetadataNamePlural: flatObjectMetadataToValidate.namePlural,
        objectMetadataNameSingular: flatObjectMetadataToValidate.nameSingular,
        objectMetadataMaps: existingFlatObjectMetadataMaps,
        existingObjectMetadataId: flatObjectMetadataToValidate.id,
      })
    ) {
      errors.push(
        new ObjectMetadataException(
          'Object already exists',
          ObjectMetadataExceptionCode.OBJECT_ALREADY_EXISTS,
          {
            userFriendlyMessage: t`Object already exists`,
          },
        ),
      );
    }

    return errors;
  }
}

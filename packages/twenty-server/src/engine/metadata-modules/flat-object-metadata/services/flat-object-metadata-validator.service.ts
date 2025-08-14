import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { FlatFieldMetadataValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-validator.service';
import { FailedFlatFieldMetadataValidationExceptions } from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-field-metadata-in-flat-object-metadata-maps-or-throw.util';
import { addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-object-metadata-to-flat-object-metadata-maps-or-throw.util';
import { FailedFlatObjectMetadataValidationExceptions } from 'src/engine/metadata-modules/flat-object-metadata/types/failed-flat-object-metadata-validation.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { areFlatObjectMetadataNamesSyncedWithLabels } from 'src/engine/metadata-modules/flat-object-metadata/utils/are-flat-object-metadata-names-synced-with-labels.util';
import { validateFlatObjectMetadataIdentifiers } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-identifiers.util';
import { validateFlatObjectMetadataLabel } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-label.util';
import { validateFlatObjectMetadataNames } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-name.util';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { doesOtherObjectWithSameNameExists } from 'src/engine/metadata-modules/utils/validate-no-other-object-with-same-name-exists-or-throw.util';

export type ValidateOneFlatObjectMetadataArgs = {
  existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
  flatObjectMetadataToValidate: FlatObjectMetadata;
  otherFlatObjectMetadataMapsToValidate?: FlatObjectMetadataMaps;
  workspaceId: string;
};

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
  }: {
    existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
    objectMetadataToDeleteId: string;
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
        flatObjectMetadataToDelete.standardId !== null &&
        !flatObjectMetadataToDelete.isCustom
      ) {
        errors.push(
          new ObjectMetadataException(
            t`Standard objects cannot be deleted`,
            ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
          ),
        );
      }

      if (flatObjectMetadataToDelete.isActive) {
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
    workspaceId,
  }: ValidateOneFlatObjectMetadataArgs) {
    const errors: FailedFlatObjectMetadataValidationExceptions[] = [];

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
    let existingFlatObjectMetadataMapsWithFlatObjectMetadataToBeCreatedWithoutFields =
      addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow({
        flatObjectMetadata: {
          ...flatObjectMetadataToValidate,
          flatFieldMetadatas: [],
        },
        flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      });

    for (const flatFieldMetadataToValidate of flatObjectMetadataToValidate.flatFieldMetadatas) {
      const otherFlatObjectMetadataMapsToValidate = undefined; // TODO prastoin when implementing import

      const flatFieldValidatorErrors =
        await this.flatFieldMetadataValidatorService.validateFlatFieldMetadataCreation(
          {
            existingFlatObjectMetadataMaps:
              existingFlatObjectMetadataMapsWithFlatObjectMetadataToBeCreatedWithoutFields,
            flatFieldMetadataToValidate,
            workspaceId,
            otherFlatObjectMetadataMapsToValidate,
          },
        );

      if (flatFieldValidatorErrors.length > 0) {
        allFlatFieldMetadatasValidationErrors.push(...flatFieldValidatorErrors);
        continue;
      }

      existingFlatObjectMetadataMapsWithFlatObjectMetadataToBeCreatedWithoutFields =
        addFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
          flatFieldMetadata: flatFieldMetadataToValidate,
          flatObjectMetadataMaps:
            existingFlatObjectMetadataMapsWithFlatObjectMetadataToBeCreatedWithoutFields,
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

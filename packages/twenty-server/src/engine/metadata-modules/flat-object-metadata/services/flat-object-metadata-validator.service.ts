import { t } from '@lingui/core/macro';
import { Injectable } from '@nestjs/common';

import { FlatFieldMetadataValidatorService } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-validator.service';
import { FailedFlatFieldMetadataValidationExceptions } from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { validateFlatObjectMetadataLabel } from 'src/engine/metadata-modules/flat-object-metadata/validators/validate-flat-object-metadata-label.validator';
import { validateFlatObjectMetadataNames } from 'src/engine/metadata-modules/flat-object-metadata/validators/validate-flat-object-metadata-name.validator';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { computeMetadataNameFromLabel } from 'src/engine/metadata-modules/utils/validate-name-and-label-are-sync-or-throw.util';
import { validatesNoOtherObjectWithSameNameExists } from 'src/engine/metadata-modules/utils/validate-no-other-object-with-same-name-exists-or-throw.util';

export type ValidateOneFlatObjectMetadataArgs = {
  existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
  flatObjectdMetadataToValidate: FlatObjectMetadata;
  workspaceId: string;
};

@Injectable()
export class FlatObjectMetadataValidatorService {
  constructor(
    private readonly flatFieldMetadataValidatorService: FlatFieldMetadataValidatorService,
  ) {}

  public async validateFlatObjectMetadataCreation({
    existingFlatObjectMetadataMaps,
    flatObjectdMetadataToValidate,
    workspaceId,
  }: ValidateOneFlatObjectMetadataArgs) {
    const errors: FailedFlatFieldMetadataValidationExceptions[] = [];
    errors.push(
      ...validateFlatObjectMetadataNames({
        namePlural: flatObjectdMetadataToValidate.namePlural,
        nameSingular: flatObjectdMetadataToValidate.nameSingular,
      }),
    );

    errors.push(
      ...validateFlatObjectMetadataLabel({
        labelPlural: flatObjectdMetadataToValidate.labelPlural,
        labelSingular: flatObjectdMetadataToValidate.labelSingular,
      }),
    );

    if (flatObjectdMetadataToValidate.isRemote) {
      errors.push(
        new ObjectMetadataException(
          t`Remote object are not supported yet`,
          ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
        ),
      );
    }

    if (flatObjectdMetadataToValidate.isLabelSyncedWithName === true) {
      const computedNameSingular = computeMetadataNameFromLabel(
        flatObjectdMetadataToValidate.labelSingular,
      );

      if (computedNameSingular !== flatObjectdMetadataToValidate.nameSingular) {
        errors.push(
          new ObjectMetadataException(
            t`Singular name is not synched with singular label`,
            ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
          ),
        );
      }

      const computedNamePlural = computeMetadataNameFromLabel(
        flatObjectdMetadataToValidate.labelSingular,
      );

      if (computedNamePlural !== flatObjectdMetadataToValidate.namePlural) {
        errors.push(
          new ObjectMetadataException(
            t`Singular plural is not synched with plural label`,
            ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
          ),
        );
      }
    }

    if (
      validatesNoOtherObjectWithSameNameExists({
        objectMetadataNamePlural: flatObjectdMetadataToValidate.namePlural,
        objectMetadataNameSingular: flatObjectdMetadataToValidate.nameSingular,
        objectMetadataMaps: existingFlatObjectMetadataMaps,
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

    const flatFieldValidationErrors = (
      await Promise.all(
        flatObjectdMetadataToValidate.flatFieldMetadatas.map(
          async (flatFieldMetadataToValidate) =>
            await this.flatFieldMetadataValidatorService.validateFlatFieldMetadataCreation(
              {
                existingFlatObjectMetadataMaps,
                flatFieldMetadataToValidate,
                workspaceId,
                // TODO prastoin
                // Should we have a sequential update here too ? No relation so far so no need ftm at least on this api but we will use this method in import funnel too so we should
                otherFlatObjectMetadataMapsToValidate: undefined,
              },
            ),
        ),
      )
    ).flat();

    if (flatFieldValidationErrors.length > 0) {
      errors.push(...flatFieldValidationErrors);
    }

    return errors;
  }
}

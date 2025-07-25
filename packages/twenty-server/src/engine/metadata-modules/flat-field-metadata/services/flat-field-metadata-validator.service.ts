import { Injectable } from '@nestjs/common';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FlatFieldMetadataValidationResult } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-result.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { validateFlatFieldMetadataNameAvailability } from 'src/engine/metadata-modules/flat-field-metadata/validators/validate-flat-field-metadata-name-availability.validator';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import {
  InvalidMetadataException,
  InvalidMetadataExceptionCode,
} from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';
import { validateMetadataNameOrThrow } from 'src/engine/metadata-modules/utils/validate-metadata-name.utils';
import { computeMetadataNameFromLabel } from 'src/engine/metadata-modules/utils/validate-name-and-label-are-sync-or-throw.util';
import { Expect } from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// What about update ? FromTo<> ?
type ValidateOneFieldMetadataArgs = {
  existingFlatObjectMetadata: FlatObjectMetadata[];
  othersFlatObjectMetadataToValidate?: FlatObjectMetadata[];
  flatFieldMetadataToValidate: FlatFieldMetadata;
  // flatFieldMetadataToValidateRelatedFlatObjectMetadata lol
  workspaceId: string;
};
// We need to infer if this is going to be an udpate or not

@Injectable()
export class FlatFieldMetadataValidatorService {
  constructor(private readonly featureFlagService: FeatureFlagService) {}

  /**
   * This method only validates the end data, it should never mutate anything
   * Only returns exceptions to the caller
   */
  async validateOneFlatFieldMetadata({
    existingFlatObjectMetadata,
    flatFieldMetadataToValidate,
    othersFlatObjectMetadataToValidate,
    workspaceId,
  }: ValidateOneFieldMetadataArgs): Promise<FlatFieldMetadataValidationResult> {
    const allFlatObjectMetadata = [
      ...existingFlatObjectMetadata,
      ...(othersFlatObjectMetadataToValidate ?? []),
    ];
    // Common TODO facto in own scope
    const parentFlatObjectMetadata = allFlatObjectMetadata.find(
      (existingFlatObjectMetadata) =>
        // Should this be unique identifier ?? I'm confused :thinking:
        existingFlatObjectMetadata.id ===
        flatFieldMetadataToValidate.objectMetadataId,
    );

    if (!isDefined(parentFlatObjectMetadata)) {
      return {
        status: 'fail',
        error: new FieldMetadataException(
          isDefined(othersFlatObjectMetadataToValidate)
            ? 'Object metadata does not exist in both existing and about to be created object metadatass'
            : 'Object metadata does not exist',
          FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        ),
      };
    }

    if (parentFlatObjectMetadata.isRemote === true) {
      return {
        status: 'fail',
        error: new ObjectMetadataException(
          'Remote objects are read-only',
          ObjectMetadataExceptionCode.OBJECT_MUTATION_NOT_ALLOWED,
        ),
      };
    }

    if (flatFieldMetadataToValidate.isLabelSyncedWithName) {
      const computedName = computeMetadataNameFromLabel(
        flatFieldMetadataToValidate.label,
      );

      if (flatFieldMetadataToValidate.name !== computedName) {
        return {
          status: 'fail',
          error: new InvalidMetadataException(
            `Name is not synced with label. Expected name: "${computedName}", got ${name}`,
            InvalidMetadataExceptionCode.NAME_NOT_SYNCED_WITH_LABEL,
          ),
        };
      }
    }

    try {
      validateMetadataNameOrThrow(flatFieldMetadataToValidate.name);
    } catch (error) {
      return {
        status: 'fail',
        error: new FieldMetadataException(
          error.message,
          FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          {
            userFriendlyMessage: error.userFriendlyMessage,
          },
        ),
      };
    }

    const failedNameAvailabilityValidation =
      validateFlatFieldMetadataNameAvailability({
        name: flatFieldMetadataToValidate.name,
        objectMetadata: parentFlatObjectMetadata,
      });
    if (isDefined(failedNameAvailabilityValidation)) {
      return failedNameAvailabilityValidation;
    }

    /// End of common

    switch (flatFieldMetadataToValidate.type) {
      case FieldMetadataType.RELATION:
      case FieldMetadataType.MORPH_RELATION: {
        // Facto in dedicated service
        const isMorphRelationEnabled =
          await this.featureFlagService.isFeatureEnabled(
            FeatureFlagKey.IS_MORPH_RELATION_ENABLED,
            workspaceId,
          );

        if (!isMorphRelationEnabled) {
          return {
            status: 'fail',
            error: new FieldMetadataException(
              'Object metadata does not exist',
              FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
            ),
          };
        }

        return {
          status: 'success',
        };
        ///
      }
      case FieldMetadataType.UUID:
      case FieldMetadataType.TEXT:
      case FieldMetadataType.PHONES:
      case FieldMetadataType.EMAILS:
      case FieldMetadataType.DATE_TIME:
      case FieldMetadataType.DATE:
      case FieldMetadataType.BOOLEAN:
      case FieldMetadataType.NUMBER:
      case FieldMetadataType.NUMERIC:
      case FieldMetadataType.LINKS:
      case FieldMetadataType.CURRENCY:
      case FieldMetadataType.FULL_NAME:
      case FieldMetadataType.RATING:
      case FieldMetadataType.SELECT:
      case FieldMetadataType.MULTI_SELECT:
      case FieldMetadataType.POSITION:
      case FieldMetadataType.ADDRESS:
      case FieldMetadataType.RAW_JSON:
      case FieldMetadataType.RICH_TEXT:
      case FieldMetadataType.RICH_TEXT_V2:
      case FieldMetadataType.ACTOR:
      case FieldMetadataType.ARRAY:
      case FieldMetadataType.TS_VECTOR: {
        return {
          status: 'success',
        };
      }
      default: {
        const _staticTypeCheck: Expect<
          typeof flatFieldMetadataToValidate.type extends never ? true : false
        > = true;

        return {
          status: 'fail',
          error: new FieldMetadataException(
            'Object metadata does not exist',
            FieldMetadataExceptionCode.UNCOVERED_FIELD_METADATA_TYPE_VALIDATION,
          ),
        };
      }
    }
  }
}

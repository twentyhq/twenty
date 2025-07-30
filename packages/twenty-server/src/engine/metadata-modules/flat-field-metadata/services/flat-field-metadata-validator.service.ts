import { Injectable } from '@nestjs/common';

import { Expect } from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FailedFlatFieldMetadataValidation } from 'src/engine/metadata-modules/flat-field-metadata/types/failed-flat-field-metadata-validation.type';
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

type ValidateOneFieldMetadataArgs = {
  existingFlatObjectMetadatas: FlatObjectMetadata[];
  othersFlatObjectMetadataToValidate?: FlatObjectMetadata[];
  flatFieldMetadataToValidate: FlatFieldMetadata;
  workspaceId: string;
};

@Injectable()
export class FlatFieldMetadataValidatorService {
  constructor(private readonly featureFlagService: FeatureFlagService) {}

  async validateOneFlatFieldMetadata({
    existingFlatObjectMetadatas,
    flatFieldMetadataToValidate,
    othersFlatObjectMetadataToValidate,
    workspaceId,
  }: ValidateOneFieldMetadataArgs): Promise<
    FailedFlatFieldMetadataValidation | undefined
  > {
    const allFlatObjectMetadata = [
      ...existingFlatObjectMetadatas,
      ...(othersFlatObjectMetadataToValidate ?? []),
    ];
    const parentFlatObjectMetadata = allFlatObjectMetadata.find(
      (existingFlatObjectMetadata) =>
        existingFlatObjectMetadata.id ===
        flatFieldMetadataToValidate.objectMetadataId, // Question: Should we comparing unique identifier here ?
    );

    if (!isDefined(parentFlatObjectMetadata)) {
      return {
        status: 'fail',
        error: new FieldMetadataException(
          isDefined(othersFlatObjectMetadataToValidate)
            ? 'Object metadata does not exist in both existing and about to be created object metadatas'
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
            `Name is not synced with label. Expected name: "${computedName}", got ${flatFieldMetadataToValidate.name}`,
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

    // We should validate each default value and settings and options
    // We should also handle relation and stuff
    switch (flatFieldMetadataToValidate.type) {
      case FieldMetadataType.MORPH_RELATION: {
        const isMorphRelationEnabled =
          await this.featureFlagService.isFeatureEnabled(
            FeatureFlagKey.IS_MORPH_RELATION_ENABLED,
            workspaceId,
          );

        if (!isMorphRelationEnabled) {
          return {
            status: 'fail',
            error: new FieldMetadataException(
              'Morph relation feature is disabled',
              FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
            ),
          };
        }

        return;
      }
      case FieldMetadataType.RELATION:
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
        return;
      }
      default: {
        const _staticTypeCheck: Expect<
          typeof flatFieldMetadataToValidate.type extends never ? true : false
        > = true;

        return {
          status: 'fail',
          error: new FieldMetadataException(
            'Unsupported field metadata type',
            FieldMetadataExceptionCode.UNCOVERED_FIELD_METADATA_TYPE_VALIDATION,
          ),
        };
      }
    }
  }
}

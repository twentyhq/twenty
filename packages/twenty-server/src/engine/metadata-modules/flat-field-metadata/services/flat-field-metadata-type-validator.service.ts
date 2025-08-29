import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { isDefined } from 'class-validator';
import { FieldMetadataType } from 'twenty-shared/types';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { ValidateOneFieldMetadataArgs } from 'src/engine/metadata-modules/flat-field-metadata/services/flat-field-metadata-validator.service';
import { type FlatFieldMetadataTypeValidator } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-type-validator.type';
import { FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { validateEnumSelectFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-enum-flat-field-metadata.util';
import { validateRelationOrMorphRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-relation-or-morph-relation-flat-field-metadata.util';
@Injectable()
export class FlatFieldMetadataTypeValidatorService {
  constructor(private readonly featureFlagService: FeatureFlagService) {}

  private readonly FIELD_METADATA_TYPE_VALIDATOR_HASHMAP: FlatFieldMetadataTypeValidator =
    {
      ACTOR: async (_args) => {
        return [];
      },
      ADDRESS: async (_args) => {
        return [];
      },
      ARRAY: async (_args) => {
        return [];
      },
      BOOLEAN: async (_args) => {
        return [];
      },
      CURRENCY: async (_args) => {
        return [];
      },
      DATE: async (_args) => {
        return [];
      },
      DATE_TIME: async (_args) => {
        return [];
      },
      EMAILS: async (_args) => {
        return [];
      },
      FULL_NAME: async (_args) => {
        return [];
      },
      LINKS: async (_args) => {
        return [];
      },
      MORPH_RELATION: async ({
        workspaceId,
        existingFlatObjectMetadataMaps,
        flatFieldMetadataToValidate,
        otherFlatObjectMetadataMapsToValidate,
      }) => {
        const isMorphRelationEnabled =
          await this.featureFlagService.isFeatureEnabled(
            FeatureFlagKey.IS_MORPH_RELATION_ENABLED,
            workspaceId,
          );

        if (!isMorphRelationEnabled) {
          return [
            {
              code: FieldMetadataExceptionCode.UNCOVERED_FIELD_METADATA_TYPE_VALIDATION,
              message: 'Morph relation feature flag is disabled',
              userFriendlyMessage: t`Morph relation fields are disabled for your workspace`,
            },
          ];
        }

        return validateRelationOrMorphRelationFlatFieldMetadata({
          existingFlatObjectMetadataMaps,
          flatFieldMetadataToValidate,
          workspaceId,
          otherFlatObjectMetadataMapsToValidate,
        });
      },
      MULTI_SELECT: ({
        existingFlatObjectMetadataMaps,
        flatFieldMetadataToValidate,
        workspaceId,
        otherFlatObjectMetadataMapsToValidate,
      }) =>
        validateEnumSelectFlatFieldMetadata({
          existingFlatObjectMetadataMaps,
          flatFieldMetadataToValidate,
          workspaceId,
          otherFlatObjectMetadataMapsToValidate,
        }),

      NUMBER: async (_args) => {
        return [];
      },
      NUMERIC: async (_args) => {
        return [];
      },
      PHONES: async (_args) => {
        return [];
      },
      POSITION: async (_args) => {
        return [];
      },
      RATING: ({
        existingFlatObjectMetadataMaps,
        flatFieldMetadataToValidate,
        workspaceId,
        otherFlatObjectMetadataMapsToValidate,
      }) =>
        validateEnumSelectFlatFieldMetadata({
          existingFlatObjectMetadataMaps,
          flatFieldMetadataToValidate,
          workspaceId,
          otherFlatObjectMetadataMapsToValidate,
        }),
      RAW_JSON: async (_args) => {
        return [];
      },
      RELATION: ({
        existingFlatObjectMetadataMaps,
        flatFieldMetadataToValidate,
        workspaceId,
        otherFlatObjectMetadataMapsToValidate,
      }) =>
        validateRelationOrMorphRelationFlatFieldMetadata({
          existingFlatObjectMetadataMaps,
          flatFieldMetadataToValidate,
          workspaceId,
          otherFlatObjectMetadataMapsToValidate,
        }),
      RICH_TEXT: async (_args) => {
        return [];
      },
      RICH_TEXT_V2: async (_args) => {
        return [];
      },
      SELECT: ({
        existingFlatObjectMetadataMaps,
        flatFieldMetadataToValidate,
        workspaceId,
        otherFlatObjectMetadataMapsToValidate,
      }) =>
        validateEnumSelectFlatFieldMetadata({
          existingFlatObjectMetadataMaps,
          flatFieldMetadataToValidate,
          workspaceId,
          otherFlatObjectMetadataMapsToValidate,
        }),
      TEXT: async (_args) => {
        return [];
      },
      TS_VECTOR: async (_args) => {
        return [];
      },
      UUID: async (_args) => {
        return [];
      },
    };

  public async validateFlatFieldMetadataTypeSpecificities<
    T extends FieldMetadataType = FieldMetadataType,
  >({
    existingFlatObjectMetadataMaps,
    flatFieldMetadataToValidate,
    workspaceId,
    otherFlatObjectMetadataMapsToValidate,
  }: ValidateOneFieldMetadataArgs<T>): Promise<
    FlatFieldMetadataValidationError[]
  > {
    const fieldMetadataTypeValidator =
      this.FIELD_METADATA_TYPE_VALIDATOR_HASHMAP[
        flatFieldMetadataToValidate.type
      ];

    if (!isDefined(fieldMetadataTypeValidator)) {
      const fieldType = flatFieldMetadataToValidate.type;

      return [
        {
          code: FieldMetadataExceptionCode.UNCOVERED_FIELD_METADATA_TYPE_VALIDATION,
          message: `Unsupported field metadata type ${fieldType}`,
          value: fieldType,
          userFriendlyMessage: t`Unsupported field metadata type ${fieldType}`,
        },
      ];
    }

    return await fieldMetadataTypeValidator({
      existingFlatObjectMetadataMaps,
      flatFieldMetadataToValidate,
      workspaceId,
      otherFlatObjectMetadataMapsToValidate,
    });
  }
}

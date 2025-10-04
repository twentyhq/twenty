import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { isDefined } from 'class-validator';
import { FieldMetadataType } from 'twenty-shared/types';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataTypeValidator } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-type-validator.type';
import { FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { validateEnumSelectFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-enum-flat-field-metadata.util';
import { validateMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-morph-or-relation-flat-field-metadata.util';
import { ValidateOneFieldMetadataArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-field-metadata-validator.service';
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
        dependencyOptimisticFlatEntityMaps,
        flatFieldMetadataToValidate,
        optimisticFlatFieldMetadataMaps,
        remainingFlatEntityMapsToValidate,
        workspaceId,
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

        return validateMorphOrRelationFlatFieldMetadata({
          dependencyOptimisticFlatEntityMaps,
          flatFieldMetadataToValidate,
          optimisticFlatFieldMetadataMaps,
          remainingFlatEntityMapsToValidate,
          workspaceId,
        });
      },
      MULTI_SELECT: ({
        dependencyOptimisticFlatEntityMaps,
        flatFieldMetadataToValidate,
        optimisticFlatFieldMetadataMaps,
        remainingFlatEntityMapsToValidate,
        workspaceId,
      }) =>
        validateEnumSelectFlatFieldMetadata({
          dependencyOptimisticFlatEntityMaps,
          flatFieldMetadataToValidate,
          optimisticFlatFieldMetadataMaps,
          remainingFlatEntityMapsToValidate,
          workspaceId,
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
        dependencyOptimisticFlatEntityMaps,
        flatFieldMetadataToValidate,
        optimisticFlatFieldMetadataMaps,
        remainingFlatEntityMapsToValidate,
        workspaceId,
      }) =>
        validateEnumSelectFlatFieldMetadata({
          dependencyOptimisticFlatEntityMaps,
          flatFieldMetadataToValidate,
          optimisticFlatFieldMetadataMaps,
          remainingFlatEntityMapsToValidate,
          workspaceId,
        }),
      RAW_JSON: async (_args) => {
        return [];
      },
      RELATION: ({
        dependencyOptimisticFlatEntityMaps,
        flatFieldMetadataToValidate,
        optimisticFlatFieldMetadataMaps,
        remainingFlatEntityMapsToValidate,
        workspaceId,
      }) =>
        validateMorphOrRelationFlatFieldMetadata({
          dependencyOptimisticFlatEntityMaps,
          flatFieldMetadataToValidate,
          optimisticFlatFieldMetadataMaps,
          remainingFlatEntityMapsToValidate,
          workspaceId,
        }),
      RICH_TEXT: async (_args) => {
        return [];
      },
      RICH_TEXT_V2: async (_args) => {
        return [];
      },
      SELECT: ({
        dependencyOptimisticFlatEntityMaps,
        flatFieldMetadataToValidate,
        optimisticFlatFieldMetadataMaps,
        remainingFlatEntityMapsToValidate,
        workspaceId,
      }) =>
        validateEnumSelectFlatFieldMetadata({
          dependencyOptimisticFlatEntityMaps,
          flatFieldMetadataToValidate,
          optimisticFlatFieldMetadataMaps,
          remainingFlatEntityMapsToValidate,
          workspaceId,
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
    dependencyOptimisticFlatEntityMaps,
    flatFieldMetadataToValidate,
    optimisticFlatFieldMetadataMaps,
    remainingFlatEntityMapsToValidate,
    workspaceId,
  }: ValidateOneFieldMetadataArgs<T> & { workspaceId: string }): Promise<
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
      dependencyOptimisticFlatEntityMaps,
      flatFieldMetadataToValidate,
      optimisticFlatFieldMetadataMaps,
      remainingFlatEntityMapsToValidate,
      workspaceId,
    });
  }
}

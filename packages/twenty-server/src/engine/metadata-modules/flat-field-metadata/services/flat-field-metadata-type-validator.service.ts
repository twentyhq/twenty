import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'class-validator';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataTypeValidator } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-type-validator.type';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { validateEnumSelectFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-enum-flat-field-metadata.util';
import { validateMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-morph-or-relation-flat-field-metadata.util';
import { type FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';

const DEFAULT_NO_VALIDATION = async (): Promise<
  FlatFieldMetadataValidationError[]
> => [];

@Injectable()
export class FlatFieldMetadataTypeValidatorService {
  constructor(private readonly featureFlagService: FeatureFlagService) {}

  private readonly FIELD_METADATA_TYPE_VALIDATOR_HASHMAP: FlatFieldMetadataTypeValidator =
    {
      ACTOR: DEFAULT_NO_VALIDATION,
      ADDRESS: DEFAULT_NO_VALIDATION,
      ARRAY: DEFAULT_NO_VALIDATION,
      BOOLEAN: DEFAULT_NO_VALIDATION,
      CURRENCY: DEFAULT_NO_VALIDATION,
      DATE: DEFAULT_NO_VALIDATION,
      DATE_TIME: DEFAULT_NO_VALIDATION,
      EMAILS: DEFAULT_NO_VALIDATION,
      FULL_NAME: DEFAULT_NO_VALIDATION,
      LINKS: DEFAULT_NO_VALIDATION,
      NUMBER: DEFAULT_NO_VALIDATION,
      NUMERIC: DEFAULT_NO_VALIDATION,
      PHONES: DEFAULT_NO_VALIDATION,
      POSITION: DEFAULT_NO_VALIDATION,
      RAW_JSON: DEFAULT_NO_VALIDATION,
      RICH_TEXT: DEFAULT_NO_VALIDATION,
      RICH_TEXT_V2: DEFAULT_NO_VALIDATION,
      TEXT: DEFAULT_NO_VALIDATION,
      TS_VECTOR: DEFAULT_NO_VALIDATION,
      UUID: DEFAULT_NO_VALIDATION,

      MORPH_RELATION: async (args) => {
        const isMorphRelationEnabled =
          await this.featureFlagService.isFeatureEnabled(
            FeatureFlagKey.IS_MORPH_RELATION_ENABLED,
            args.workspaceId,
          );

        if (!isMorphRelationEnabled) {
          return [
            {
              code: FieldMetadataExceptionCode.UNCOVERED_FIELD_METADATA_TYPE_VALIDATION,
              message: 'Morph relation feature flag is disabled',
              userFriendlyMessage: msg`Morph relation fields are disabled for your workspace`,
            },
          ];
        }

        return validateMorphOrRelationFlatFieldMetadata(args);
      },
      PDF: async (_args) => {
        return [];
      },
      IMAGE: async (_args) => {
        return [];
      },
      MULTI_SELECT: validateEnumSelectFlatFieldMetadata,
      RATING: validateEnumSelectFlatFieldMetadata,
      RELATION: validateMorphOrRelationFlatFieldMetadata,
      SELECT: validateEnumSelectFlatFieldMetadata,
    };

  public async validateFlatFieldMetadataTypeSpecificities(
    args: FlatEntityValidationArgs<'fieldMetadata'>,
  ): Promise<FlatFieldMetadataValidationError[]> {
    const { flatEntityToValidate } = args;
    const fieldType = flatEntityToValidate.type;
    const fieldMetadataTypeValidator =
      this.FIELD_METADATA_TYPE_VALIDATOR_HASHMAP[fieldType];

    if (!isDefined(fieldMetadataTypeValidator)) {
      return [
        {
          code: FieldMetadataExceptionCode.UNCOVERED_FIELD_METADATA_TYPE_VALIDATION,
          message: `Unsupported field metadata type ${fieldType}`,
          value: fieldType,
          userFriendlyMessage: msg`Unsupported field metadata type ${fieldType}`,
        },
      ];
    }

    return await fieldMetadataTypeValidator(
      // @ts-expect-error TODO could be improved
      args,
    );
  }
}

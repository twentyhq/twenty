import { Injectable } from '@nestjs/common';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FlatFieldMetadataTypeValidator } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-type-validator.type';
import { isEnumValidateOneFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-validate-one-field-metadata-args.util';
import { validateEnumSelectFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/validate-enum-flat-field-metadata.validator';
import { validateRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/validate-relation-flat-field-metadata.validator';
@Injectable()
export class FlatFieldMetadataTypeValidatorService {
  constructor(private readonly featureFlagService: FeatureFlagService) {}

  public readonly FIELD_METADATA_TYPE_VALIDATOR_HASHMAP: FlatFieldMetadataTypeValidator =
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
      MORPH_RELATION: async ({ workspaceId }) => {
        const isMorphRelationEnabled =
          await this.featureFlagService.isFeatureEnabled(
            FeatureFlagKey.IS_MORPH_RELATION_ENABLED,
            workspaceId,
          );

        if (!isMorphRelationEnabled) {
          return [
            new FieldMetadataException(
              'Morph relation feature is disabled',
              FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
            ),
          ];
        }

        return [];
      },
      MULTI_SELECT: (args) => {
        if (!isEnumValidateOneFieldMetadata(args)) {
          throw new FieldMetadataException(
            'Should never occur, invaliad enum field metadata type',
            FieldMetadataExceptionCode.INTERNAL_SERVER_ERROR,
          );
        }

        return validateEnumSelectFlatFieldMetadata(args);
      },
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
      RATING: (args) => {
        if (!isEnumValidateOneFieldMetadata(args)) {
          throw new FieldMetadataException(
            'Should never occur, invaliad enum field metadata type',
            FieldMetadataExceptionCode.INTERNAL_SERVER_ERROR,
          );
        }

        return validateEnumSelectFlatFieldMetadata(args);
      },
      RAW_JSON: async (_args) => {
        return [];
      },
      RELATION: validateRelationFlatFieldMetadata,
      RICH_TEXT: async (_args) => {
        return [];
      },
      RICH_TEXT_V2: async (_args) => {
        return [];
      },
      SELECT: (args) => {
        if (!isEnumValidateOneFieldMetadata(args)) {
          throw new FieldMetadataException(
            'Should never occur, invaliad enum field metadata type',
            FieldMetadataExceptionCode.INTERNAL_SERVER_ERROR,
          );
        }

        return validateEnumSelectFlatFieldMetadata(args);
      },
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
}

import { Injectable } from '@nestjs/common';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FlatFieldMetadataTypeValidator } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-type-validator.type';
import { validateRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/validate-relation-flat-field-metadata.validator';
@Injectable()
export class FlatFieldMetadataTypeValidatorService {
  constructor(private readonly featureFlagService: FeatureFlagService) {}

  public readonly FIELD_METADATA_TYPE_VALIDATOR_HASHMAP: FlatFieldMetadataTypeValidator =
    {
      ACTOR: async (args) => {
        return [];
      },
      ADDRESS: async (args) => {
        return [];
      },
      ARRAY: async (args) => {
        return [];
      },
      BOOLEAN: async (args) => {
        return [];
      },
      CURRENCY: async (args) => {
        return [];
      },
      DATE: async (args) => {
        return [];
      },
      DATE_TIME: async (args) => {
        return [];
      },
      EMAILS: async (args) => {
        return [];
      },
      FULL_NAME: async (args) => {
        return [];
      },
      LINKS: async (args) => {
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
      MULTI_SELECT: async (args) => {
        return [];
      },
      NUMBER: async (args) => {
        return [];
      },
      NUMERIC: async (args) => {
        return [];
      },
      PHONES: async (args) => {
        return [];
      },
      POSITION: async (args) => {
        return [];
      },
      RATING: async (args) => {
        return [];
      },
      RAW_JSON: async (args) => {
        return [];
      },
      RELATION: validateRelationFlatFieldMetadata,
      RICH_TEXT: async (args) => {
        return [];
      },
      RICH_TEXT_V2: async (args) => {
        return [];
      },
      SELECT: async (args) => {
        return [];
      },
      TEXT: async (args) => {
        return [];
      },
      TS_VECTOR: async (args) => {
        return [];
      },
      UUID: async (args) => {
        return [];
      },
    };
}

import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'class-validator';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FlatEntityPropertiesUpdates } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';
import { type FlatFieldMetadataTypeValidator } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-type-validator.type';
import { FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { validateEnumSelectFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-enum-flat-field-metadata.util';
import { validateMorphRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-morph-relation-flat-field-metadata.util';
import { validateRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-relation-flat-field-metadata.util';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';

const DEFAULT_NO_VALIDATION = (): FlatFieldMetadataValidationError[] => [];

export type GenericValidateFlatFieldMetadataTypeSpecificitiesArgs =
  FlatEntityValidationArgs<'fieldMetadata'> & {
    updates?: FlatEntityPropertiesUpdates<'fieldMetadata'>;
  };

@Injectable()
export class FlatFieldMetadataTypeValidatorService {
  constructor() {}

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
      MORPH_RELATION: validateMorphRelationFlatFieldMetadata,
      MULTI_SELECT: validateEnumSelectFlatFieldMetadata,
      RATING: validateEnumSelectFlatFieldMetadata,
      RELATION: validateRelationFlatFieldMetadata,
      SELECT: validateEnumSelectFlatFieldMetadata,
    };

  public validateFlatFieldMetadataTypeSpecificities(
    args: GenericValidateFlatFieldMetadataTypeSpecificitiesArgs,
  ): FlatFieldMetadataValidationError[] {
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

    return fieldMetadataTypeValidator(
      // @ts-expect-error TODO could be improved
      args,
    );
  }
}

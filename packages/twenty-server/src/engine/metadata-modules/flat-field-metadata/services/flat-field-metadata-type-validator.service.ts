import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'class-validator';
import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import {
  FlatFieldMetadataTypeValidationArgs,
  type FlatFieldMetadataTypeValidator,
} from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-type-validator.type';
import { FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { validateEnumSelectFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-enum-flat-field-metadata.util';
import { validateFilesFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-files-flat-field-metadata.util';
import { validateMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-morph-or-relation-flat-field-metadata.util';
import { validateMorphRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-morph-relation-flat-field-metadata.util';
import { validatePositionFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-position-flat-field-metadata.util';
import { validateTsVectorFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-ts-vector-flat-field-metadata.util';

const DEFAULT_NO_VALIDATION = (): FlatFieldMetadataValidationError[] => [];

const rejectUserCreation = (
  fieldType: FieldMetadataType,
  message: string,
  userFriendlyMessage: ReturnType<typeof msg>,
) => {
  return (
    args: FlatFieldMetadataTypeValidationArgs<FieldMetadataType>,
  ): FlatFieldMetadataValidationError[] => {
    const isCreation = !isDefined(args.update);
    const isCustomField = args.flatEntityToValidate.isCustom;

    if (isCreation && isCustomField) {
      return [
        {
          code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          message,
          value: fieldType,
          userFriendlyMessage,
        },
      ];
    }

    return [];
  };
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
      FILES: validateFilesFlatFieldMetadata,
      FULL_NAME: DEFAULT_NO_VALIDATION,
      LINKS: DEFAULT_NO_VALIDATION,
      NUMBER: DEFAULT_NO_VALIDATION,
      NUMERIC: rejectUserCreation(
        FieldMetadataType.NUMERIC,
        'Field type NUMERIC is not supported for field creation. Use NUMBER instead.',
        msg`Field type NUMERIC is not supported. Use Number instead.`,
      ),
      PHONES: DEFAULT_NO_VALIDATION,
      POSITION: validatePositionFlatFieldMetadata,
      RAW_JSON: DEFAULT_NO_VALIDATION,
      RICH_TEXT: DEFAULT_NO_VALIDATION,
      RICH_TEXT_V2: DEFAULT_NO_VALIDATION,
      TEXT: DEFAULT_NO_VALIDATION,
      TS_VECTOR: validateTsVectorFlatFieldMetadata,
      UUID: DEFAULT_NO_VALIDATION,
      MORPH_RELATION: validateMorphRelationFlatFieldMetadata,
      MULTI_SELECT: validateEnumSelectFlatFieldMetadata,
      RATING: validateEnumSelectFlatFieldMetadata,
      RELATION: validateMorphOrRelationFlatFieldMetadata,
      SELECT: validateEnumSelectFlatFieldMetadata,
    };

  public validateFlatFieldMetadataTypeSpecificities(
    args: FlatFieldMetadataTypeValidationArgs<FieldMetadataType>,
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

import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'class-validator';
import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FlatEntityPropertiesUpdates } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';
import { type FlatFieldMetadataTypeValidator } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-type-validator.type';
import { FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';
import { validateEnumSelectFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-enum-flat-field-metadata.util';
import { validateMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-morph-or-relation-flat-field-metadata.util';
import { validateMorphRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-morph-relation-flat-field-metadata.util';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';

const DEFAULT_NO_VALIDATION = (): FlatFieldMetadataValidationError[] => [];

export type GenericValidateFlatFieldMetadataTypeSpecificitiesArgs =
  FlatEntityValidationArgs<'fieldMetadata'> & {
    updates?: FlatEntityPropertiesUpdates<'fieldMetadata'>;
  };

const rejectUserCreation = (
  fieldType: FieldMetadataType,
  message: string,
  userFriendlyMessage: ReturnType<typeof msg>,
) => {
  return (
    args: GenericValidateFlatFieldMetadataTypeSpecificitiesArgs,
  ): FlatFieldMetadataValidationError[] => {
    const isCreation = !isDefined(args.updates);
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
      FULL_NAME: DEFAULT_NO_VALIDATION,
      LINKS: DEFAULT_NO_VALIDATION,
      NUMBER: DEFAULT_NO_VALIDATION,
      NUMERIC: rejectUserCreation(
        FieldMetadataType.NUMERIC,
        'Field type NUMERIC is not supported for field creation. Use NUMBER instead.',
        msg`Field type NUMERIC is not supported. Use Number instead.`,
      ),
      PHONES: DEFAULT_NO_VALIDATION,
      POSITION: rejectUserCreation(
        FieldMetadataType.POSITION,
        'Field type POSITION is a system type and cannot be created manually.',
        msg`Field type POSITION is a system type and cannot be created manually.`,
      ),
      RAW_JSON: DEFAULT_NO_VALIDATION,
      RICH_TEXT: DEFAULT_NO_VALIDATION,
      RICH_TEXT_V2: DEFAULT_NO_VALIDATION,
      TEXT: DEFAULT_NO_VALIDATION,
      TS_VECTOR: rejectUserCreation(
        FieldMetadataType.TS_VECTOR,
        'Field type TS_VECTOR is a system type and cannot be created manually.',
        msg`Field type TS_VECTOR is a system type and cannot be created manually.`,
      ),
      UUID: DEFAULT_NO_VALIDATION,
      MORPH_RELATION: validateMorphRelationFlatFieldMetadata,
      MULTI_SELECT: validateEnumSelectFlatFieldMetadata,
      RATING: validateEnumSelectFlatFieldMetadata,
      RELATION: validateMorphOrRelationFlatFieldMetadata,
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

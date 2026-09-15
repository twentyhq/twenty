import { msg } from '@lingui/core/macro';
import {
  MetadataWritability,
  type FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatFieldMetadataTypeValidationArgs } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-type-validator.type';
import { type FlatFieldMetadataValidationError } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-validation-error.type';

export const validateTsVectorFlatFieldMetadata = ({
  flatEntityToValidate,
  update,
}: FlatFieldMetadataTypeValidationArgs<FieldMetadataType.TS_VECTOR>): FlatFieldMetadataValidationError[] => {
  const errors: FlatFieldMetadataValidationError[] = [];

  if (flatEntityToValidate.name !== 'searchVector') {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: `Field type TS_VECTOR must be named "searchVector", got "${flatEntityToValidate.name}"`,
      value: flatEntityToValidate.name,
      userFriendlyMessage: msg`Field type TS_VECTOR must be named "searchVector"`,
    });
  }

  if (!flatEntityToValidate.isSystem) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: 'Field type TS_VECTOR must be a system field',
      value: flatEntityToValidate.isSystem,
      userFriendlyMessage: msg`Field type TS_VECTOR must be a system field`,
    });
  }

  const isUpdateLeavingWritabilityUntouched =
    isDefined(update) && !('writability' in update);

  if (
    !isUpdateLeavingWritabilityUntouched &&
    flatEntityToValidate.writability !== MetadataWritability.SYSTEM
  ) {
    errors.push({
      code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      message: 'Field type TS_VECTOR must have SYSTEM writability',
      value: flatEntityToValidate.writability,
      userFriendlyMessage: msg`Field type TS_VECTOR must have SYSTEM writability`,
    });
  }

  return errors;
};
